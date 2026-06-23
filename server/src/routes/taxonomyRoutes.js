import { Router } from 'express';
import {
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  listCategories,
  listTags,
  updateCategory,
  updateTag,
} from '../controllers/taxonomyController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/categories', listCategories);
router.post('/categories', requireAuth, createCategory);
router.put('/categories/:categoryId', requireAuth, updateCategory);
router.delete('/categories/:categoryId', requireAuth, deleteCategory);

router.get('/tags', listTags);
router.post('/tags', requireAuth, createTag);
router.put('/tags/:tagId', requireAuth, updateTag);
router.delete('/tags/:tagId', requireAuth, deleteTag);

export const taxonomyRoutes = router;
