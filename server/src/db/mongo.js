import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from '../config/env.js';

let memoryServer;

export async function connectDatabase() {
  const connectionUri = await resolveMongoUri();
  await mongoose.connect(connectionUri, {
    dbName: env.mongoDbName,
  });

  return {
    uri: connectionUri,
    inMemory: Boolean(memoryServer),
  };
}

async function resolveMongoUri() {
  if (env.mongoUri) {
    return env.mongoUri;
  }

  if (!env.useInMemoryDb) {
    throw new Error('MONGO_URI is required when USE_IN_MEMORY_DB is false.');
  }

  memoryServer = await MongoMemoryServer.create({
    instance: {
      dbName: env.mongoDbName,
    },
  });

  return memoryServer.getUri();
}

export async function closeDatabase() {
  await mongoose.connection.close();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
}
