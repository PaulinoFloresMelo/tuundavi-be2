// src/types.ts

import { createDb } from './db';

export type Env = {
  JWT_SECRET: string,
  TURSO_CONNECTION_URL: string,
  TURSO_AUTH_TOKEN: string,
  ASSETS: Fetcher;
}

export type Variables = {
  db: ReturnType<typeof createDb>;
};