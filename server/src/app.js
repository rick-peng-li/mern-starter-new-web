import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authRoutes } from './routes/authRoutes.js';
import { env } from './config/env.js';
import { taxonomyRoutes } from './routes/taxonomyRoutes.js';
import { uploadRoutes } from './routes/uploadRoutes.js';
import { postRoutes } from './routes/postRoutes.js';
import { healthRoutes } from './routes/healthRoutes.js';
import { handleError } from './controllers/postController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const uploadPath = path.resolve(__dirname, '../uploads');

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    })
  );
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/api', (_req, res) => {
    res.json({
      name: 'mern-starter-new-web-api',
      version: '3.0.0',
      endpoints: [
        '/api/health',
        '/api/auth/login',
        '/api/auth/register',
        '/api/posts',
        '/api/posts/stats/overview',
        '/api/taxonomy/categories',
        '/api/taxonomy/tags',
        '/api/uploads/image',
      ],
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/taxonomy', taxonomyRoutes);
  app.use('/api/uploads', uploadRoutes);

  app.use('/uploads', express.static(uploadPath));
  app.use(express.static(clientDistPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    const indexFilePath = path.join(clientDistPath, 'index.html');

    if (!fs.existsSync(indexFilePath)) {
      return res.status(200).json({
        message: 'Client build was not found. Run "npm run build" to serve the bundled app.',
      });
    }

    return res.sendFile(indexFilePath);
  });

  app.use(handleError);
  return app;
}
