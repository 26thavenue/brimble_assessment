import { deploymentRepository } from '../repositories/index.js';
import type { Deployment, DeploymentStatus, CreateDeploymentInput } from '../types/index.js';

export class DeploymentService {
  getAllDeployments(): Deployment[] {
    return deploymentRepository.findAll();
  }

  getDeploymentById(id: string): Deployment | null {
    return deploymentRepository.findById(id);
  }

  createDeployment(input: CreateDeploymentInput): Deployment {
    const name = input.name || this.extractNameFromGitUrl(input.gitUrl) || 'app';
    
    const deployment = deploymentRepository.create({
      name,
      gitUrl: input.gitUrl,
    });
    
    this.simulateDeploymentProcess(deployment.id);
    
    return deployment;
  }

  updateDeploymentStatus(id: string, status: DeploymentStatus, imageTag?: string, liveUrl?: string): Deployment | null {
    const deployment = deploymentRepository.update(id, {
      status,
      imageTag,
      liveUrl,
    });
    
    if (deployment) {
      deploymentRepository.addLog(id, `[${status.toUpperCase()}] Status updated to ${status}`);
    }
    
    return deployment;
  }

  getDeploymentLogs(deploymentId: string) {
    return deploymentRepository.getLogs(deploymentId);
  }

  deleteDeployment(id: string): boolean {
    return deploymentRepository.delete(id);
  }

  private extractNameFromGitUrl(gitUrl: string): string | null {
    const match = gitUrl.match(/\/([^/]+?)(?:\.git)?$/);
    return match ? match[1] : null;
  }

  private async simulateDeploymentProcess(deploymentId: string) {
    const steps: DeploymentStatus[] = ['building', 'deploying', 'running'];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const status = steps[i];
      const imageTag = status === 'deploying' ? `app:v${Date.now()}` : undefined;
      const liveUrl = status === 'running' ? `http://localhost:${3000 + Math.floor(Math.random() * 1000)}` : undefined;
      
      this.updateDeploymentStatus(deploymentId, status, imageTag || undefined, liveUrl || undefined);
    }
  }
}

export const deploymentService = new DeploymentService();