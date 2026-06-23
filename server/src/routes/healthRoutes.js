import { Router } from 'express';
import { healthCheck } from '../controllers/postController.js';

const router = Router();
router.get('/', healthCheck);

export const healthRoutes = router;
