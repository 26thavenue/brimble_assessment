declare class PortRegistry {
    private allocated;
    private nextPort;
    allocate(deploymentId: string): number;
    get(deploymentId: string): number | undefined;
    release(deploymentId: string): void;
    isPortInUse(port: number): boolean;
}
export declare const portRegistry: PortRegistry;
export {};
