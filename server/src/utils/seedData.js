import bcrypt from 'bcryptjs';
import { Category } from '../models/Category.js';
import { Post } from '../models/Post.js';
import { Tag } from '../models/Tag.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { ensureCategoryExists, ensureTagsExist } from './taxonomy.js';

const demoPosts = [
  {
    title: 'Building a Maintainable MERN Editorial Workflow',
    summary: 'A starter overview showing how the dashboard, API layer and persistence work together in a modern MERN setup.',
    content:
      '## Overview\n\nThis demo article explains the current application architecture.\n\n- Create, review and publish posts\n- Organize content with categories and tags\n- Use Markdown for maintainable content editing',
    author: 'Editorial Team',
    category: 'Architecture',
    tags: ['mern', 'react', 'express'],
    contentFormat: 'markdown',
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    lastEditedBy: 'Admin User',
  },
  {
    title: 'Draft Content Planning for New Campaigns',
    summary: 'Use draft mode to prepare, revise and approve content before it goes live.',
    content:
      '## Draft workflow\n\nDraft mode keeps editorial work safe while allowing rapid iteration.\n\n1. Prepare the first version\n2. Review the summary and taxonomy\n3. Publish when ready',
    author: 'Operations Lead',
    category: 'Operations',
    tags: ['workflow', 'draft'],
    contentFormat: 'markdown',
    status: 'draft',
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    lastEditedBy: 'Admin User',
  },
  {
    title: 'Scaling API Design for Content Dashboards',
    summary: 'A compact example of search, filtering, statistics aggregation and clean JSON responses for admin tools.',
    content:
      '## API considerations\n\nThe API exposes CRUD endpoints, overview metrics and filtering capabilities.\n\n```js\napp.use(\"/api/posts\", postRoutes);\n```\n\nThese primitives make it easy to extend the product later.',
    author: 'Platform Engineer',
    category: 'Backend',
    tags: ['api', 'mongoose', 'dashboard'],
    contentFormat: 'markdown',
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    lastEditedBy: 'Admin User',
  },
];

export async function seedDemoData() {
  const adminEmail = env.adminEmail.toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail }).lean();

  if (!existingAdmin) {
    await User.create({
      name: env.adminName,
      email: adminEmail,
      passwordHash: await bcrypt.hash(env.adminPassword, 10),
      role: 'admin',
    });
  }

  await ensureCategoryExists('Architecture', 'Architecture and system design topics.');
  await ensureCategoryExists('Operations', 'Editorial and team workflow topics.');
  await ensureCategoryExists('Backend', 'Backend engineering and API topics.');
  await ensureCategoryExists('General', 'Fallback category for uncategorized posts.');
  await ensureTagsExist(['mern', 'react', 'express', 'workflow', 'draft', 'api', 'mongoose', 'dashboard']);

  const postCount = await Post.countDocuments();

  if (postCount === 0) {
    await Post.insertMany(demoPosts);
  }

  await Category.updateOne({ name: 'General' }, { $setOnInsert: { description: 'Fallback category.' } }, { upsert: true });
  await Tag.updateOne({ name: 'mern' }, { $setOnInsert: { description: 'MERN stack related content.' } }, { upsert: true });
}
