import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

function toBoolean(value, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }

  return String(value).toLowerCase() === 'true';
}

export const env = {
  port: Number(process.env.PORT || 5001),
  mongoUri: process.env.MONGO_URI || '',
  mongoDbName: process.env.MONGO_DB_NAME || 'mern_starter_new_web',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  useInMemoryDb: toBoolean(process.env.USE_IN_MEMORY_DB, true),
  seedDemoData: toBoolean(process.env.SEED_DEMO_DATA, true),
  jwtSecret: process.env.JWT_SECRET || 'change-this-in-production',
  adminName: process.env.ADMIN_NAME || 'Admin User',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin123456',
  nodeEnv: process.env.NODE_ENV || 'development',
};
