import { Category } from '../models/Category.js';
import { Post } from '../models/Post.js';
import { Tag } from '../models/Tag.js';
import { taxonomyPayloadSchema } from '../validation/taxonomySchema.js';
import {
  ensureCategoryExists,
  ensureTagsExist,
  normalizeName,
  removeCategoryEverywhere,
  removeTagEverywhere,
  renameCategoryEverywhere,
  renameTagEverywhere,
  toSlug,
} from '../utils/taxonomy.js';

async function mapCategoriesWithUsage() {
  const [items, usage] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    Post.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
  ]);

  const usageMap = new Map(usage.map((item) => [item._id, item.count]));

  return items.map((item) => ({
    ...item,
    usageCount: usageMap.get(item.name) || 0,
  }));
}

async function mapTagsWithUsage() {
  const [items, usage] = await Promise.all([
    Tag.find().sort({ name: 1 }).lean(),
    Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
    ]),
  ]);

  const usageMap = new Map(usage.map((item) => [item._id, item.count]));

  return items.map((item) => ({
    ...item,
    usageCount: usageMap.get(item.name) || 0,
  }));
}

export async function listCategories(_req, res, next) {
  try {
    const items = await mapCategoriesWithUsage();
    return res.json({ items });
  } catch (error) {
    return next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const payload = taxonomyPayloadSchema.parse(req.body);
    const name = normalizeName(payload.name);
    await ensureCategoryExists(name, payload.description);
    const item = await Category.findOne({ slug: toSlug(name) }).lean();
    return res.status(201).json({ item });
  } catch (error) {
    return next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const payload = taxonomyPayloadSchema.parse(req.body);
    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const nextName = normalizeName(payload.name);
    const previousName = category.name;
    category.name = nextName;
    category.slug = toSlug(nextName);
    category.description = payload.description || '';
    await category.save();

    if (previousName !== nextName) {
      await renameCategoryEverywhere(previousName, nextName);
    }

    return res.json({ item: category.toObject() });
  } catch (error) {
    return next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    await removeCategoryEverywhere(category.name);
    await category.deleteOne();
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

export async function listTags(_req, res, next) {
  try {
    const items = await mapTagsWithUsage();
    return res.json({ items });
  } catch (error) {
    return next(error);
  }
}

export async function createTag(req, res, next) {
  try {
    const payload = taxonomyPayloadSchema.parse(req.body);
    const name = normalizeName(payload.name);
    await ensureTagsExist([name]);
    await Tag.updateOne({ slug: toSlug(name) }, { $set: { description: payload.description || '' } });
    const item = await Tag.findOne({ slug: toSlug(name) }).lean();

    return res.status(201).json({ item });
  } catch (error) {
    return next(error);
  }
}

export async function updateTag(req, res, next) {
  try {
    const payload = taxonomyPayloadSchema.parse(req.body);
    const tag = await Tag.findById(req.params.tagId);

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found.' });
    }

    const nextName = normalizeName(payload.name);
    const previousName = tag.name;
    tag.name = nextName;
    tag.slug = toSlug(nextName);
    tag.description = payload.description || '';
    await tag.save();

    if (previousName !== nextName) {
      await renameTagEverywhere(previousName, nextName);
    }

    return res.json({ item: tag.toObject() });
  } catch (error) {
    return next(error);
  }
}

export async function deleteTag(req, res, next) {
  try {
    const tag = await Tag.findById(req.params.tagId);

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found.' });
    }

    await removeTagEverywhere(tag.name);
    await tag.deleteOne();
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}
