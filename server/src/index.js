import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './db/mongo.js';
import { seedDemoData } from './utils/seedData.js';

async function start() {
  const connection = await connectDatabase();

  if (env.seedDemoData) {
    await seedDemoData();
  }

  const app = createApp();
  app.listen(env.port, () => {
    const modeLabel = connection.inMemory ? 'in-memory MongoDB' : 'external MongoDB';
    console.log(`API server running on http://localhost:${env.port} using ${modeLabel}`);
  });
}

start().catch((error) => {
  console.error('Failed to start the server');
  console.error(error);
  process.exit(1);
});
