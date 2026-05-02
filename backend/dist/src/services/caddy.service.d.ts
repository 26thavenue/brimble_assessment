export declare class CaddyService {
    addRoute(deploymentId: string, port: number): Promise<void>;
    removeRoute(deploymentId: string): Promise<void>;
}
export declare const caddyService: CaddyService;
