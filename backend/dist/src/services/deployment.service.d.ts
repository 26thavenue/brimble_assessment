import type { Deployment, DeploymentStatus, CreateDeploymentInput } from '../types/index.js';
export declare class DeploymentService {
    getAllDeployments(): Deployment[];
    getDeploymentById(id: string): Deployment | null;
    createDeployment(input: CreateDeploymentInput): Deployment;
    createDeploymentFromArchive(archivePath: string, name: string): Promise<Deployment>;
    updateDeploymentStatus(id: string, status: DeploymentStatus, imageTag?: string, liveUrl?: string): Deployment | null;
    getDeploymentLogs(deploymentId: string): {
        id: number;
        createdAt: Date;
        deploymentId: string;
        message: string;
    }[];
    deleteDeployment(id: string): boolean;
    rollbackDeployment(id: string): Promise<Deployment | null>;
    redeployDeployment(id: string): Promise<Deployment | null>;
    private extractNameFromGitUrl;
    private runPipeline;
    private runPipelineFromArchive;
}
export declare const deploymentService: DeploymentService;
