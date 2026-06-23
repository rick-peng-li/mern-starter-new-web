import slugify from 'slugify';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { Post } from '../models/Post.js';

export function normalizeName(value) {
  return value.trim().replace(/\s+/g, ' ');
}

export function toSlug(value) {
  return slugify(normalizeName(value), { lower: true, strict: true });
}

export async function ensureCategoryExists(name, description = '') {
  const normalizedName = normalizeName(name);
  const slug = toSlug(normalizedName);

  await Category.findOneAndUpdate(
    { slug },
    {
      name: normalizedName,
      slug,
      description,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function ensureTagsExist(names) {
  const uniqueNames = [...new Set(names.map(normalizeName).filter(Boolean))];

  await Promise.all(
    uniqueNames.map((name) =>
      Tag.findOneAndUpdate(
        { slug: toSlug(name) },
        { name, slug: toSlug(name) },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );
}

export async function renameCategoryEverywhere(oldName, newName) {
  await Post.updateMany({ category: oldName }, { $set: { category: newName } });
}

export async function removeCategoryEverywhere(categoryName) {
  const fallbackCategory = 'General';
  await ensureCategoryExists(fallbackCategory, 'Fallback category for uncategorized posts.');
  await Post.updateMany({ category: categoryName }, { $set: { category: fallbackCategory } });
}

export async function renameTagEverywhere(oldName, newName) {
  const affectedPosts = await Post.find({ tags: oldName });

  await Promise.all(
    affectedPosts.map((post) => {
      const tags = post.tags.map((tag) => (tag === oldName ? newName : tag));
      post.tags = [...new Set(tags)];
      return post.save();
    })
  );
}

export async function removeTagEverywhere(tagName) {
  await Post.updateMany({ tags: tagName }, { $pull: { tags: tagName } });
}
