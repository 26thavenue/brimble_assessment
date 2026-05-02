import { deploymentService, logEmitterService } from '../services/index.js';
export class DeploymentController {
    getAllDeployments = async (req, res) => {
        const deployments = deploymentService.getAllDeployments();
        res.json(deployments);
    };
    getDeploymentById = async (req, res) => {
        const id = req.params.id;
        const deployment = deploymentService.getDeploymentById(id);
        if (!deployment) {
            res.status(404).json({ error: 'Deployment not found' });
            return;
        }
        res.json(deployment);
    };
    createDeployment = async (req, res) => {
        const deployment = deploymentService.createDeployment({
            gitUrl: req.body.gitUrl,
            name: req.body.name || '',
        });
        res.status(201).json(deployment);
    };
    updateDeployment = async (req, res) => {
        const id = req.params.id;
        const deployment = deploymentService.updateDeploymentStatus(id, req.body.status, req.body.imageTag, req.body.liveUrl);
        if (!deployment) {
            res.status(404).json({ error: 'Deployment not found' });
            return;
        }
        res.json(deployment);
    };
    deleteDeployment = async (req, res) => {
        const id = req.params.id;
        const deleted = deploymentService.deleteDeployment(id);
        if (!deleted) {
            res.status(404).json({ error: 'Deployment not found' });
            return;
        }
        res.status(204).send();
    };
    getDeploymentLogs = async (req, res) => {
        const id = req.params.id;
        const deployment = deploymentService.getDeploymentById(id);
        if (!deployment) {
            res.status(404).json({ error: 'Deployment not found' });
            return;
        }
        const logs = deploymentService.getDeploymentLogs(id);
        res.json(logs);
    };
    streamLogs = async (req, res) => {
        const id = req.params.id;
        const deployment = deploymentService.getDeploymentById(id);
        if (!deployment) {
            res.status(404).json({ error: 'Deployment not found' });
            return;
        }
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();
        const existingLogs = logEmitterService.getExistingLogs(id);
        for (const log of existingLogs) {
            res.write(`data: ${JSON.stringify({ type: 'history', log })}\n\n`);
        }
        const unsubscribe = logEmitterService.subscribe(id, (log) => {
            res.write(`data: ${JSON.stringify({ type: 'new', log })}\n\n`);
        });
        const heartbeat = setInterval(() => {
            res.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
        }, 15000);
        req.on('close', () => {
            unsubscribe();
            clearInterval(heartbeat);
        });
        req.on('end', () => {
            unsubscribe();
            clearInterval(heartbeat);
        });
    };
    rollbackDeployment = async (req, res) => {
        const id = req.params.id;
        const deployment = await deploymentService.rollbackDeployment(id);
        if (!deployment) {
            res.status(404).json({ error: 'Deployment not found or cannot be rolled back' });
            return;
        }
        res.json(deployment);
    };
    redeployDeployment = async (req, res) => {
        const id = req.params.id;
        const deployment = await deploymentService.redeployDeployment(id);
        if (!deployment) {
            res.status(404).json({ error: 'Deployment not found or cannot be redeployed' });
            return;
        }
        res.json(deployment);
    };
}
export const deploymentController = new DeploymentController();
