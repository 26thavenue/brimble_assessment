const MIN_PORT = 8080;
const MAX_PORT = 9000;
class PortRegistry {
    allocated = new Map();
    nextPort = MIN_PORT;
    allocate(deploymentId) {
        if (this.allocated.has(deploymentId)) {
            return this.allocated.get(deploymentId);
        }
        while (this.nextPort <= MAX_PORT) {
            const port = this.nextPort;
            this.nextPort++;
            if (![...this.allocated.values()].includes(port)) {
                this.allocated.set(deploymentId, port);
                return port;
            }
        }
        throw new Error('No available ports in range');
    }
    get(deploymentId) {
        return this.allocated.get(deploymentId);
    }
    release(deploymentId) {
        this.allocated.delete(deploymentId);
    }
    isPortInUse(port) {
        return [...this.allocated.values()].includes(port);
    }
}
export const portRegistry = new PortRegistry();
