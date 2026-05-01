import type { Deployment, DeploymentStatus, CreateDeploymentInput } from '../types/index.js';
export declare class DeploymentService {
    getAllDeployments(): Deployment[];
    getDeploymentById(id: string): Deployment | null;
    createDeployment(input: CreateDeploymentInput): Deployment;
    updateDeploymentStatus(id: string, status: DeploymentStatus, imageTag?: string, liveUrl?: string): Deployment | null;
    getDeploymentLogs(deploymentId: string): {
        id: number;
        createdAt: Date;
        deploymentId: string;
        message: string;
    }[];
    deleteDeployment(id: string): boolean;
    private extractNameFromGitUrl;
    private simulateDeploymentProcess;
}
export declare const deploymentService: DeploymentService;
