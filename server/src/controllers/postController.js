import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { Post } from '../models/Post.js';
import { validatePostPayload } from '../validation/postSchema.js';
import { ensureCategoryExists, ensureTagsExist } from '../utils/taxonomy.js';

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  updated: { updatedAt: -1 },
  title: { title: 1 },
  published: { publishedAt: -1, updatedAt: -1 },
};

function estimateReadingMinutes(content) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function formatPost(post) {
  return {
    ...post,
    readingMinutes: estimateReadingMinutes(post.content || ''),
  };
}

function buildFilter(query) {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.tag) {
    filter.tags = query.tag;
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { summary: { $regex: query.search, $options: 'i' } },
      { content: { $regex: query.search, $options: 'i' } },
      { author: { $regex: query.search, $options: 'i' } },
    ];
  }

  return filter;
}

function resolveSort(sortKey) {
  return SORT_OPTIONS[sortKey] || SORT_OPTIONS.updated;
}

function toNotFoundError(postId) {
  const error = new Error(`Post ${postId} was not found.`);
  error.statusCode = 404;
  return error;
}

export async function listPosts(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 9), 50);
    const filter = buildFilter(req.query);
    const sort = req.query.sort || 'updated';

    const [items, total] = await Promise.all([
      Post.find(filter).sort(resolveSort(sort)).skip((page - 1) * limit).limit(limit).lean(),
      Post.countDocuments(filter),
    ]);

    res.json({
      items: items.map(formatPost),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      filters: filter,
      sort,
      availableSorts: Object.keys(SORT_OPTIONS),
    });
  } catch (error) {
    next(error);
  }
}

export async function getPost(req, res, next) {
  try {
    const item = await Post.findOne({ publicId: req.params.postId }).lean();

    if (!item) {
      throw toNotFoundError(req.params.postId);
    }

    res.json({ item: formatPost(item) });
  } catch (error) {
    next(error);
  }
}

export async function createPost(req, res, next) {
  try {
    const payload = validatePostPayload(req.body);
    await ensureCategoryExists(payload.category);
    await ensureTagsExist(payload.tags);
    const item = await Post.create({
      ...payload,
      lastEditedBy: req.user?.name || payload.author,
    });
    res.status(201).json({ item: formatPost(item.toObject()) });
  } catch (error) {
    next(error);
  }
}

export async function updatePost(req, res, next) {
  try {
    const payload = validatePostPayload(req.body);
    await ensureCategoryExists(payload.category);
    await ensureTagsExist(payload.tags);
    const item = await Post.findOneAndUpdate({ publicId: req.params.postId }, payload, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      throw toNotFoundError(req.params.postId);
    }

    item.lastEditedBy = req.user?.name || payload.author;
    await item.save();

    res.json({ item: formatPost(item.toObject()) });
  } catch (error) {
    next(error);
  }
}

export async function deletePost(req, res, next) {
  try {
    const item = await Post.findOneAndDelete({ publicId: req.params.postId }).lean();

    if (!item) {
      throw toNotFoundError(req.params.postId);
    }

    res.status(200).json({ success: true, deletedId: req.params.postId });
  } catch (error) {
    next(error);
  }
}

export async function getPostStats(_req, res, next) {
  try {
    const [statusCounts, categoryDistribution, tagCloud, total, authorCounts] = await Promise.all([
      Post.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Post.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
      Post.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 8 },
      ]),
      Post.countDocuments(),
      Post.aggregate([
        { $group: { _id: '$author', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 5 },
      ]),
    ]);

    const totals = {
      all: total,
      published: statusCounts.find((item) => item._id == 'published')?.count || 0,
      draft: statusCounts.find((item) => item._id == 'draft')?.count || 0,
      categories: categoryDistribution.length,
    };

    res.json({
      totals,
      categoryDistribution: categoryDistribution.map((item) => ({
        category: item._id,
        count: item.count,
      })),
      popularTags: tagCloud.map((item) => ({ tag: item._id, count: item.count })),
      topAuthors: authorCounts.map((item) => ({ author: item._id, count: item.count })),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

export function healthCheck(_req, res) {
  res.json({
    status: 'ok',
    service: 'mern-starter-new-web-api',
    timestamp: new Date().toISOString(),
    databaseState: mongoose.connection.readyState,
  });
}

export function handleError(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      issues: error.issues,
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: 'A record with the same unique field already exists.',
    });
  }

  if (error.name === 'MulterError') {
    return res.status(400).json({
      message: error.message,
    });
  }

  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    message: error.message || 'Internal server error',
  });
}
