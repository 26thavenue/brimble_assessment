export type DeploymentStatus = 'pending' | 'building' | 'deploying' | 'running' | 'failed';
export interface Deployment {
    id: string;
    name: string;
    gitUrl: string | null;
    status: DeploymentStatus;
    imageTag: string | null;
    liveUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface DeploymentLog {
    id: number;
    deploymentId: string;
    message: string;
    createdAt: Date;
}
export interface CreateDeploymentInput {
    name: string;
    gitUrl: string;
}
export interface UpdateDeploymentInput {
    status?: DeploymentStatus;
    imageTag?: string;
    liveUrl?: string;
}
