import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        production: "production";
        test: "test";
    }>>;
    DATABASE_PATH: z.ZodDefault<z.ZodString>;
    CORS_ORIGIN: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema>;
export declare function getEnv(): Env;
export declare const config: {
    PORT: number;
    NODE_ENV: "development" | "production" | "test";
    DATABASE_PATH: string;
    CORS_ORIGIN: string;
};
