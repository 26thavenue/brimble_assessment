import { Request, Response } from 'express';
export declare class DeploymentController {
    getAllDeployments: (req: Request, res: Response) => Promise<void>;
    getDeploymentById: (req: Request, res: Response) => Promise<void>;
    createDeployment: (req: Request, res: Response) => Promise<void>;
    updateDeployment: (req: Request, res: Response) => Promise<void>;
    deleteDeployment: (req: Request, res: Response) => Promise<void>;
    getDeploymentLogs: (req: Request, res: Response) => Promise<void>;
    streamLogs: (req: Request, res: Response) => Promise<void>;
    rollbackDeployment: (req: Request, res: Response) => Promise<void>;
    redeployDeployment: (req: Request, res: Response) => Promise<void>;
}
export declare const deploymentController: DeploymentController;
