import { deploymentRepository } from '../repositories/index.js';
export class DeploymentService {
    getAllDeployments() {
        return deploymentRepository.findAll();
    }
    getDeploymentById(id) {
        return deploymentRepository.findById(id);
    }
    createDeployment(input) {
        const name = this.extractNameFromGitUrl(input.gitUrl) || input.name;
        const deployment = deploymentRepository.create({
            name,
            gitUrl: input.gitUrl,
        });
        this.simulateDeploymentProcess(deployment.id);
        return deployment;
    }
    updateDeploymentStatus(id, status, imageTag, liveUrl) {
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
    getDeploymentLogs(deploymentId) {
        return deploymentRepository.getLogs(deploymentId);
    }
    deleteDeployment(id) {
        return deploymentRepository.delete(id);
    }
    extractNameFromGitUrl(gitUrl) {
        const match = gitUrl.match(/\/([^/]+?)(?:\.git)?$/);
        return match ? match[1] : null;
    }
    async simulateDeploymentProcess(deploymentId) {
        const steps = ['building', 'deploying', 'running'];
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
