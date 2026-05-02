export declare class PipelineService {
    buildFromGitUrl(gitUrl: string, deploymentId: string): Promise<{
        imageTag: string;
    }>;
    buildFromDirectory(sourceDir: string, deploymentId: string): Promise<{
        imageTag: string;
    }>;
    runContainer(imageTag: string, deploymentId: string): Promise<{
        port: number;
        liveUrl: string;
    }>;
    stopContainer(deploymentId: string): Promise<void>;
    getContainerLogs(deploymentId: string, lines?: number): Promise<string>;
    private cloneRepo;
    private runRailpack;
    private cleanupBuildDir;
}
export declare const pipelineService: PipelineService;
