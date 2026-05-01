import { Router } from 'express';
import { deploymentController } from '../controllers/index.js';
import { createDeploymentSchema, updateDeploymentSchema } from '../validators/index.js';
import { asyncHandler, validateBody } from '../middleware/index.js';

export function createDeploymentRouter() {
  const router = Router();

  router.get('/', asyncHandler(deploymentController.getAllDeployments));
  router.get('/:id', asyncHandler(deploymentController.getDeploymentById));
  router.post(
    '/',
    validateBody(createDeploymentSchema),
    asyncHandler(deploymentController.createDeployment)
  );
  router.patch(
    '/:id',
    validateBody(updateDeploymentSchema),
    asyncHandler(deploymentController.updateDeployment)
  );
  router.delete('/:id', asyncHandler(deploymentController.deleteDeployment));
  router.get('/:id/logs', asyncHandler(deploymentController.getDeploymentLogs));

  return router;
}