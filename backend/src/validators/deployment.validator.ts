import { z } from 'zod';

export const createDeploymentSchema = z.object({
  gitUrl: z.url(),
  name: z.string().optional(),
});

export const updateDeploymentSchema = z.object({
  status: z.enum(['pending', 'building', 'deploying', 'running', 'failed']).optional(),
  imageTag: z.string().optional(),
  liveUrl: z.url().optional(),
});
