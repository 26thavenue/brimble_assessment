import { deploymentRepository } from '../repositories/index.js';
import { pipelineService } from './pipeline.service.js';
import { logEmitterService } from './log-emitter.service.js';
import type { Deployment, DeploymentStatus, CreateDeploymentInput } from '../types/index.js';

export class DeploymentService {
  getAllDeployments(): Deployment[] {
    return deploymentRepository.findAll();
  }

  getDeploymentById(id: string): Deployment | null {
    return deploymentRepository.findById(id);
  }

  createDeployment(input: CreateDeploymentInput): Deployment {
    const name = input.name || (input.gitUrl ? this.extractNameFromGitUrl(input.gitUrl) : null) || 'app';
    
    const deployment = deploymentRepository.create({
      name,
      gitUrl: input.gitUrl || '',
    });
    
    if (input.gitUrl) {
      this.runPipeline(deployment.id, input.gitUrl);
    }
    
    return deployment;
  }

  async createDeploymentFromArchive(archivePath: string, name: string): Promise<Deployment> {
    const deploymentName = name || `upload-${Date.now()}`;
    
    const deployment = deploymentRepository.create({
      name: deploymentName,
      gitUrl: '',
    });
    
    await this.runPipelineFromArchive(deployment.id, archivePath);
    
    return deployment;
  }

  updateDeploymentStatus(id: string, status: DeploymentStatus, imageTag?: string, liveUrl?: string): Deployment | null {
    const deployment = deploymentRepository.update(id, {
      status,
      imageTag,
      liveUrl,
    });
    
    if (deployment) {
      logEmitterService.emitLog(id, `[${status.toUpperCase()}] Status updated to ${status}`);
    }
    
    return deployment;
  }

  getDeploymentLogs(deploymentId: string) {
    return deploymentRepository.getLogs(deploymentId);
  }

  deleteDeployment(id: string): boolean {
    const deployment = deploymentRepository.findById(id);
    if (!deployment) return false;

    if (deployment.containerId || deployment.status === 'running') {
      pipelineService.stopContainer(id).catch((err) => {
        logEmitterService.emitLog(id, `[ERROR] Failed to stop container during delete: ${err.message}`);
      });
    }
    
    return deploymentRepository.delete(id);
  }

  async rollbackDeployment(id: string): Promise<Deployment | null> {
    const deployment = deploymentRepository.findById(id);
    if (!deployment) return null;

    if (!deployment.imageTag) {
      logEmitterService.emitLog(id, '[ROLLBACK] No image tag available to rollback to');
      return null;
    }

    logEmitterService.emitLog(id, `[ROLLBACK] Rolling back to image: ${deployment.imageTag}`);
    
    if (deployment.containerId) {
      await pipelineService.stopContainer(id);
    }

    try {
      this.updateDeploymentStatus(id, 'deploying');
      const { liveUrl } = await pipelineService.runContainer(deployment.imageTag, id);
      
      const updated = this.updateDeploymentStatus(id, 'running', deployment.imageTag, liveUrl);
      logEmitterService.emitLog(id, `[ROLLBACK] Rollback complete, now running ${deployment.imageTag}`);
      return updated;
    } catch (error) {
      this.updateDeploymentStatus(id, 'failed');
      logEmitterService.emitLog(id, `[ROLLBACK] Rollback failed: ${(error as Error).message}`);
      return null;
    }
  }

  async redeployDeployment(id: string): Promise<Deployment | null> {
    const deployment = deploymentRepository.findById(id);
    if (!deployment) return null;

    if (deployment.status === 'running' && deployment.imageTag) {
      logEmitterService.emitLog(id, `[REDEPLOY] Redeploying with existing image: ${deployment.imageTag}`);
      
      if (deployment.containerId) {
        await pipelineService.stopContainer(id);
      }

      try {
        this.updateDeploymentStatus(id, 'deploying');
        const { liveUrl } = await pipelineService.runContainer(deployment.imageTag, id);
        
        const updated = this.updateDeploymentStatus(id, 'running', deployment.imageTag, liveUrl);
        return updated;
      } catch (error) {
        this.updateDeploymentStatus(id, 'failed');
        logEmitterService.emitLog(id, `[REDEPLOY] Redeploy failed: ${(error as Error).message}`);
        return null;
      }
    }

    if (deployment.gitUrl) {
      logEmitterService.emitLog(id, '[REDEPLOY] Rebuilding from Git URL');
      try {
        this.updateDeploymentStatus(id, 'building');
        const { imageTag } = await pipelineService.buildFromGitUrl(deployment.gitUrl, id);
        
        this.updateDeploymentStatus(id, 'deploying', imageTag);
        const { liveUrl } = await pipelineService.runContainer(imageTag, id);
        
        const updated = this.updateDeploymentStatus(id, 'running', imageTag, liveUrl);
        return updated;
      } catch (error) {
        this.updateDeploymentStatus(id, 'failed');
        logEmitterService.emitLog(id, `[REDEPLOY] Rebuild failed: ${(error as Error).message}`);
        return null;
      }
    }

    logEmitterService.emitLog(id, '[REDEPLOY] No source available for redeploy');
    return null;
  }

  private extractNameFromGitUrl(gitUrl: string): string | null {
    const match = gitUrl.match(/\/([^/]+?)(?:\.git)?$/);
    return match ? match[1] : null;
  }

  private async runPipeline(deploymentId: string, gitUrl: string) {
    try {
      this.updateDeploymentStatus(deploymentId, 'building');

      const { imageTag } = await pipelineService.buildFromGitUrl(gitUrl, deploymentId);
      
      this.updateDeploymentStatus(deploymentId, 'deploying', imageTag);
      
      const { liveUrl } = await pipelineService.runContainer(imageTag, deploymentId);
      
      this.updateDeploymentStatus(deploymentId, 'running', imageTag, liveUrl);
    } catch (error) {
      logEmitterService.emitLog(deploymentId, `[ERROR] Pipeline failed: ${(error as Error).message}`);
      this.updateDeploymentStatus(deploymentId, 'failed');
    }
  }

  private async runPipelineFromArchive(deploymentId: string, archivePath: string) {
    try {
      this.updateDeploymentStatus(deploymentId, 'building');

      const { imageTag } = await pipelineService.buildFromDirectory(archivePath, deploymentId);
      
      this.updateDeploymentStatus(deploymentId, 'deploying', imageTag);
      
      const { liveUrl } = await pipelineService.runContainer(imageTag, deploymentId);
      
      this.updateDeploymentStatus(deploymentId, 'running', imageTag, liveUrl);
    } catch (error) {
      logEmitterService.emitLog(deploymentId, `[ERROR] Pipeline failed: ${(error as Error).message}`);
      this.updateDeploymentStatus(deploymentId, 'failed');
    }
  }
}

export const deploymentService = new DeploymentService();
