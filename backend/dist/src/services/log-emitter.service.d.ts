import type { DeploymentLog } from '../db/schema.js';
declare class LogEmitterService {
    private emitter;
    private subscribers;
    emitLog(deploymentId: string, message: string): DeploymentLog;
    subscribe(deploymentId: string, callback: (log: DeploymentLog) => void): () => void;
    getExistingLogs(deploymentId: string): DeploymentLog[];
}
export declare const logEmitterService: LogEmitterService;
export {};
