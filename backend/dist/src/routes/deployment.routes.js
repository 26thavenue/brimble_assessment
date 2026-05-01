import { Router } from 'express';
import { z } from 'zod';
import { deploymentService } from '../services/index.js';
import { asyncHandler } from '../middleware/index.js';
const createDeploymentSchema = z.object({
    gitUrl: z.string().url(),
    name: z.string().optional(),
});
const updateDeploymentSchema = z.object({
    status: z.enum(['pending', 'building', 'deploying', 'running', 'failed']).optional(),
    imageTag: z.string().optional(),
    liveUrl: z.string().url().optional(),
});
function parseIntsafe(value) {
    const parsed = Number(value);
    return isNaN(parsed) ? null : parsed;
}
export function createDeploymentRouter() {
    const router = Router();
    router.get('/', asyncHandler(async (req, res) => {
        const deployments = deploymentService.getAllDeployments();
        res.json(deployments);
    }));
    router.get('/:id', asyncHandler(async (req, res) => {
        const id = req.params.id;
        const deployment = deploymentService.getDeploymentById(id);
        if (!deployment) {
            res.status(404).json({ error: 'Deployment not found' });
            return;
        }
        res.json(deployment);
    }));
    router.post('/', asyncHandler(async (req, res) => {
        const result = createDeploymentSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                error: 'Validation failed',
                details: result.error.issues,
            });
            return;
        }
        const deployment = deploymentService.createDeployment({
            gitUrl: result.data.gitUrl,
            name: result.data.name || '',
        });
        res.status(201).json(deployment);
    }));
    router.patch('/:id', asyncHandler(async (req, res) => {
        const id = req.params.id;
        const result = updateDeploymentSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                error: 'Validation failed',
                details: result.error.issues,
            });
            return;
        }
        const deployment = deploymentService.updateDeploymentStatus(id, result.data.status, result.data.imageTag, result.data.liveUrl);
        if (!deployment) {
            res.status(404).json({ error: 'Deployment not found' });
            return;
        }
        res.json(deployment);
    }));
    router.delete('/:id', asyncHandler(async (req, res) => {
        const id = req.params.id;
        const deleted = deploymentService.deleteDeployment(id);
        if (!deleted) {
            res.status(404).json({ error: 'Deployment not found' });
            return;
        }
        res.status(204).send();
    }));
    router.get('/:id/logs', asyncHandler(async (req, res) => {
        const id = req.params.id;
        const deployment = deploymentService.getDeploymentById(id);
        if (!deployment) {
            res.status(404).json({ error: 'Deployment not found' });
            return;
        }
        const logs = deploymentService.getDeploymentLogs(id);
        res.json(logs);
    }));
    return router;
}
