import { execa } from 'execa';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import Docker from 'dockerode';
import { logEmitterService } from './log-emitter.service.js';
import { portRegistry } from './port-registry.service.js';
import { caddyService } from './caddy.service.js';
import { deploymentRepository } from '../repositories/index.js';
const BUILD_DIR = path.join(os.tmpdir(), 'brimble-builds');
const RAILPACK_IMAGE_PREFIX = 'brimble';
if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
}
const docker = new Docker();
export class PipelineService {
    async buildFromGitUrl(gitUrl, deploymentId) {
        const buildDir = path.join(BUILD_DIR, deploymentId);
        try {
            logEmitterService.emitLog(deploymentId, `[BUILD] Cloning repository: ${gitUrl}`);
            await this.cloneRepo(gitUrl, buildDir, deploymentId);
            logEmitterService.emitLog(deploymentId, '[BUILD] Starting Railpack build...');
            const imageTag = await this.runRailpack(buildDir, deploymentId);
            logEmitterService.emitLog(deploymentId, `[BUILD] Successfully built image: ${imageTag}`);
            return { imageTag };
        }
        finally {
            await this.cleanupBuildDir(buildDir);
        }
    }
    async buildFromDirectory(sourceDir, deploymentId) {
        const buildDir = path.join(BUILD_DIR, deploymentId);
        try {
            fs.cpSync(sourceDir, buildDir, { recursive: true });
            logEmitterService.emitLog(deploymentId, '[BUILD] Starting Railpack build from uploaded project...');
            const imageTag = await this.runRailpack(buildDir, deploymentId);
            logEmitterService.emitLog(deploymentId, `[BUILD] Successfully built image: ${imageTag}`);
            return { imageTag };
        }
        finally {
            await this.cleanupBuildDir(buildDir);
        }
    }
    async runContainer(imageTag, deploymentId) {
        logEmitterService.emitLog(deploymentId, `[DEPLOY] Starting container from image: ${imageTag}`);
        const port = portRegistry.allocate(deploymentId);
        const container = await docker.createContainer({
            Image: imageTag,
            name: `brimble-${deploymentId}`,
            HostConfig: {
                PortBindings: {
                    '3000/tcp': [{ HostPort: String(port) }],
                },
                AutoRemove: false,
                RestartPolicy: { Name: 'unless-stopped' },
            },
            ExposedPorts: {
                '3000/tcp': {},
            },
        });
        await container.start();
        logEmitterService.emitLog(deploymentId, `[DEPLOY] Container started on port ${port}`);
        const liveUrl = `/deploy/${deploymentId}`;
        try {
            await caddyService.addRoute(deploymentId, port);
            logEmitterService.emitLog(deploymentId, `[DEPLOY] Caddy route configured: ${liveUrl}`);
        }
        catch (error) {
            logEmitterService.emitLog(deploymentId, `[DEPLOY] Warning: Caddy route setup failed: ${error.message}`);
        }
        deploymentRepository.update(deploymentId, {
            containerId: container.id,
            port,
        });
        return { port, liveUrl };
    }
    async stopContainer(deploymentId) {
        const deployment = deploymentRepository.findById(deploymentId);
        if (!deployment?.containerId)
            return;
        try {
            logEmitterService.emitLog(deploymentId, '[DEPLOY] Stopping container...');
            const container = docker.getContainer(deployment.containerId);
            await container.stop({ t: 10 });
            await container.remove();
            logEmitterService.emitLog(deploymentId, '[DEPLOY] Container stopped and removed');
        }
        catch (error) {
            logEmitterService.emitLog(deploymentId, `[DEPLOY] Warning: Failed to stop container: ${error.message}`);
        }
        try {
            await caddyService.removeRoute(deploymentId);
        }
        catch {
        }
        portRegistry.release(deploymentId);
        deploymentRepository.update(deploymentId, { containerId: null, port: null });
    }
    async getContainerLogs(deploymentId, lines = 100) {
        const deployment = deploymentRepository.findById(deploymentId);
        if (!deployment?.containerId)
            return 'No container running for this deployment.';
        try {
            const container = docker.getContainer(deployment.containerId);
            const logBuffer = await container.logs({
                stdout: true,
                stderr: true,
                tail: lines,
                follow: false,
            });
            return logBuffer.toString();
        }
        catch {
            return 'Unable to retrieve container logs.';
        }
    }
    async cloneRepo(gitUrl, targetDir, deploymentId) {
        if (fs.existsSync(targetDir)) {
            fs.rmSync(targetDir, { recursive: true, force: true });
        }
        const { stdout, stderr } = await execa('git', ['clone', '--depth', '1', gitUrl, targetDir], {
            cwd: BUILD_DIR,
        });
        if (stdout)
            logEmitterService.emitLog(deploymentId, `[BUILD] ${stdout}`);
        if (stderr)
            logEmitterService.emitLog(deploymentId, `[BUILD] ${stderr}`);
    }
    async runRailpack(buildDir, deploymentId) {
        const imageTag = `${RAILPACK_IMAGE_PREFIX}/${deploymentId}:v${Date.now()}`;
        const railpackBinary = process.env.RAILPACK_BINARY || 'railpack';
        const { stdout, stderr } = await execa(railpackBinary, ['build', buildDir, '--name', imageTag, '--progress', 'plain'], {
            cwd: buildDir,
            env: {
                BUILDKIT_HOST: process.env.BUILDKIT_HOST || 'docker-container://buildkit',
            },
            timeout: 300_000,
        });
        if (stdout) {
            for (const line of stdout.split('\n').filter(Boolean)) {
                logEmitterService.emitLog(deploymentId, `[RAILPACK] ${line}`);
            }
        }
        if (stderr) {
            for (const line of stderr.split('\n').filter(Boolean)) {
                logEmitterService.emitLog(deploymentId, `[RAILPACK] ${line}`);
            }
        }
        return imageTag;
    }
    async cleanupBuildDir(buildDir) {
        try {
            if (fs.existsSync(buildDir)) {
                fs.rmSync(buildDir, { recursive: true, force: true });
            }
        }
        catch {
        }
    }
}
export const pipelineService = new PipelineService();
