import { deploymentRepository } from '../repositories/index.js';
import { pipelineService } from './pipeline.service.js';
import { logEmitterService } from './log-emitter.service.js';
export class DeploymentService {
    getAllDeployments() {
        return deploymentRepository.findAll();
    }
    getDeploymentById(id) {
        return deploymentRepository.findById(id);
    }
    createDeployment(input) {
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
    async createDeploymentFromArchive(archivePath, name) {
        const deploymentName = name || `upload-${Date.now()}`;
        const deployment = deploymentRepository.create({
            name: deploymentName,
            gitUrl: '',
        });
        await this.runPipelineFromArchive(deployment.id, archivePath);
        return deployment;
    }
    updateDeploymentStatus(id, status, imageTag, liveUrl) {
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
    getDeploymentLogs(deploymentId) {
        return deploymentRepository.getLogs(deploymentId);
    }
    deleteDeployment(id) {
        const deployment = deploymentRepository.findById(id);
        if (!deployment)
            return false;
        if (deployment.containerId || deployment.status === 'running') {
            pipelineService.stopContainer(id).catch((err) => {
                logEmitterService.emitLog(id, `[ERROR] Failed to stop container during delete: ${err.message}`);
            });
        }
        return deploymentRepository.delete(id);
    }
    async rollbackDeployment(id) {
        const deployment = deploymentRepository.findById(id);
        if (!deployment)
            return null;
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
        }
        catch (error) {
            this.updateDeploymentStatus(id, 'failed');
            logEmitterService.emitLog(id, `[ROLLBACK] Rollback failed: ${error.message}`);
            return null;
        }
    }
    async redeployDeployment(id) {
        const deployment = deploymentRepository.findById(id);
        if (!deployment)
            return null;
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
            }
            catch (error) {
                this.updateDeploymentStatus(id, 'failed');
                logEmitterService.emitLog(id, `[REDEPLOY] Redeploy failed: ${error.message}`);
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
            }
            catch (error) {
                this.updateDeploymentStatus(id, 'failed');
                logEmitterService.emitLog(id, `[REDEPLOY] Rebuild failed: ${error.message}`);
                return null;
            }
        }
        logEmitterService.emitLog(id, '[REDEPLOY] No source available for redeploy');
        return null;
    }
    extractNameFromGitUrl(gitUrl) {
        const match = gitUrl.match(/\/([^/]+?)(?:\.git)?$/);
        return match ? match[1] : null;
    }
    async runPipeline(deploymentId, gitUrl) {
        try {
            this.updateDeploymentStatus(deploymentId, 'building');
            const { imageTag } = await pipelineService.buildFromGitUrl(gitUrl, deploymentId);
            this.updateDeploymentStatus(deploymentId, 'deploying', imageTag);
            const { liveUrl } = await pipelineService.runContainer(imageTag, deploymentId);
            this.updateDeploymentStatus(deploymentId, 'running', imageTag, liveUrl);
        }
        catch (error) {
            logEmitterService.emitLog(deploymentId, `[ERROR] Pipeline failed: ${error.message}`);
            this.updateDeploymentStatus(deploymentId, 'failed');
        }
    }
    async runPipelineFromArchive(deploymentId, archivePath) {
        try {
            this.updateDeploymentStatus(deploymentId, 'building');
            const { imageTag } = await pipelineService.buildFromDirectory(archivePath, deploymentId);
            this.updateDeploymentStatus(deploymentId, 'deploying', imageTag);
            const { liveUrl } = await pipelineService.runContainer(imageTag, deploymentId);
            this.updateDeploymentStatus(deploymentId, 'running', imageTag, liveUrl);
        }
        catch (error) {
            logEmitterService.emitLog(deploymentId, `[ERROR] Pipeline failed: ${error.message}`);
            this.updateDeploymentStatus(deploymentId, 'failed');
        }
    }
}
export const deploymentService = new DeploymentService();
