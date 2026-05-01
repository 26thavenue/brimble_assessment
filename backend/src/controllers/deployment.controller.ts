import { Request, Response } from 'express';
import { deploymentService } from '../services/index.js';

export class DeploymentController {
  getAllDeployments = async (req: Request, res: Response) => {
    const deployments = deploymentService.getAllDeployments();
    res.json(deployments);
  };

  getDeploymentById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const deployment = deploymentService.getDeploymentById(id);
    
    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }
    
    res.json(deployment);
  };

  createDeployment = async (req: Request, res: Response) => {
    const deployment = deploymentService.createDeployment({
      gitUrl: req.body.gitUrl,
      name: req.body.name || '',
    });
    res.status(201).json(deployment);
  };

  updateDeployment = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    
    // req.body is already validated by middleware
    const deployment = deploymentService.updateDeploymentStatus(
      id,
      req.body.status,
      req.body.imageTag,
      req.body.liveUrl
    );
    
    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }
    
    res.json(deployment);
  };

  deleteDeployment = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const deleted = deploymentService.deleteDeployment(id);
    
    if (!deleted) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }
    
    res.status(204).send();
  };

  getDeploymentLogs = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const deployment = deploymentService.getDeploymentById(id);
    
    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }
    
    const logs = deploymentService.getDeploymentLogs(id);
    res.json(logs);
  };
}

export const deploymentController = new DeploymentController();
