export interface Env {
  AI: Ai;
  DB: D1Database;
  KV_CACHE?: KVNamespace;
  VECTOR_INDEX?: VectorizeIndex;
  ENVIRONMENT?: string;
  AUTH_TOKEN?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRO_PRICE_ID?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

export interface RefineJobResult<T = any> {
  success: boolean;
  entityKey: string;
  domain: string;
  data?: T;
  summary?: string;
  confidenceScore?: number;
  diff?: any;
  error?: string;
  durationMs: number;
}
