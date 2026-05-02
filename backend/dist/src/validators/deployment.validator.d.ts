import { z } from 'zod';
export declare const createDeploymentSchema: z.ZodObject<{
    gitUrl: z.ZodURL;
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateDeploymentSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        building: "building";
        deploying: "deploying";
        running: "running";
        failed: "failed";
    }>>;
    imageTag: z.ZodOptional<z.ZodString>;
    liveUrl: z.ZodOptional<z.ZodURL>;
}, z.core.$strip>;
