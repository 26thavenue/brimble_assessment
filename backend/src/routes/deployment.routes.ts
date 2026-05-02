import { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { deploymentController } from '../controllers/index.js';
import { createDeploymentSchema, updateDeploymentSchema } from '../validators/index.js';
import { asyncHandler, validateBody } from '../middleware/index.js';
import { deploymentService } from '../services/index.js';
import AdmZip from 'adm-zip';

const uploadDir = path.join(os.tmpdir(), 'brimble-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.zip', '.tar.gz', '.tgz'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.includes('zip') || file.mimetype.includes('tar')) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip and .tar.gz files are allowed'));
    }
  },
});

export function createDeploymentRouter() {
  const router = Router();

  router.get('/', asyncHandler(deploymentController.getAllDeployments));
  router.get('/:id', asyncHandler(deploymentController.getDeploymentById));
  router.post(
    '/',
    validateBody(createDeploymentSchema),
    asyncHandler(deploymentController.createDeployment)
  );
  router.post(
    '/upload',
    upload.single('project'),
    asyncHandler(async (req, res) => {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const name = req.body.name || '';
      const archivePath = req.file.path;
      const extractDir = path.join(uploadDir, `extract-${Date.now()}`);

      try {
        if (req.file.mimetype.includes('zip') || req.file.originalname.endsWith('.zip')) {
          const zip = new AdmZip(archivePath);
          zip.extractAllTo(extractDir, true);
        } else {
          res.status(400).json({ error: 'tar.gz extraction not yet supported, use .zip' });
          return;
        }

        const contents = fs.readdirSync(extractDir);
        const sourceDir = contents.length === 1 && fs.statSync(path.join(extractDir, contents[0])).isDirectory()
          ? path.join(extractDir, contents[0])
          : extractDir;

        const deployment = await deploymentService.createDeploymentFromArchive(sourceDir, name);
        res.status(201).json(deployment);
      } catch (error) {
        res.status(500).json({ error: `Failed to process upload: ${(error as Error).message}` });
      } finally {
        fs.rmSync(archivePath, { force: true });
        fs.rmSync(extractDir, { recursive: true, force: true });
      }
    })
  );
  router.patch(
    '/:id',
    validateBody(updateDeploymentSchema),
    asyncHandler(deploymentController.updateDeployment)
  );
  router.post('/:id/rollback', asyncHandler(deploymentController.rollbackDeployment));
  router.post('/:id/redeploy', asyncHandler(deploymentController.redeployDeployment));
  router.delete('/:id', asyncHandler(deploymentController.deleteDeployment));
  router.get('/:id/logs', asyncHandler(deploymentController.getDeploymentLogs));
  router.get('/:id/logs/stream', asyncHandler(deploymentController.streamLogs));

  return router;
}
