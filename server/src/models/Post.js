import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import slugify from 'slugify';

const postSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      default: () => nanoid(10),
      unique: true,
      immutable: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    contentFormat: {
      type: String,
      enum: ['markdown'],
      default: 'markdown',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    coverImage: {
      type: String,
      default: '',
      trim: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    lastEditedBy: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

postSchema.pre('validate', function assignSlugAndPublishedAt(next) {
  this.slug = slugify(this.title, { lower: true, strict: true }) || this.publicId;

  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  if (this.status === 'draft') {
    this.publishedAt = null;
  }

  next();
});

export const Post = mongoose.model('Post', postSchema);
