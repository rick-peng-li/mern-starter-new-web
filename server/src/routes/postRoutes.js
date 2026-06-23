import { Router } from 'express';
import {
  createPost,
  deletePost,
  getPost,
  getPostStats,
  listPosts,
  updatePost,
} from '../controllers/postController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', listPosts);
router.get('/stats/overview', getPostStats);
router.get('/:postId', getPost);
router.post('/', requireAuth, createPost);
router.put('/:postId', requireAuth, updatePost);
router.delete('/:postId', requireAuth, deletePost);

export const postRoutes = router;
