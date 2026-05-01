import type { Deployment, DeploymentLog } from '../db/schema.js';
import type { CreateDeploymentInput, UpdateDeploymentInput } from '../types/index.js';
export declare class DeploymentRepository {
    findAll(): Deployment[];
    findById(id: string): Deployment | null;
    create(input: CreateDeploymentInput): Deployment;
    update(id: string, input: UpdateDeploymentInput): Deployment | null;
    delete(id: string): boolean;
    getLogs(deploymentId: string): DeploymentLog[];
    addLog(deploymentId: string, message: string): DeploymentLog;
}
export declare const deploymentRepository: DeploymentRepository;
