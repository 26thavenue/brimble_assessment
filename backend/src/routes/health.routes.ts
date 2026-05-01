import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/index.js';

export function createHealthRouter() {
  const router = Router();

  router.get('/', asyncHandler(async (req, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }));

  router.get('/live', asyncHandler(async (req, res: Response) => {
    res.status(204).send();
  }));

  router.get('/ready', asyncHandler(async (req, res: Response) => {
    res.status(204).send();
  }));

  return router;
}