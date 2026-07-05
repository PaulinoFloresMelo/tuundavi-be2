// src/types.ts

import { createDb } from './db';

export type Env = {
  JWT_SECRET: string,
  TURSO_CONNECTION_URL: string,
  TURSO_AUTH_TOKEN: string,
  ASSETS: Fetcher;
  IMAGES_BUCKET: R2Bucket;
  AUDIO_BUCKET: R2Bucket;
}

export type Variables = {
  db: ReturnType<typeof createDb>;
};