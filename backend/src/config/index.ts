import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3002),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_PATH: z.string().default('./data/database.sqlite'),
  CORS_ORIGIN: z.string().default('*'),
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(): Env {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.message);
    process.exit(1);
  }
  
  return result.data;
}

export const config = getEnv();