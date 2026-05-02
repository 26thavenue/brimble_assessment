const MIN_PORT = 8080;
const MAX_PORT = 9000;

class PortRegistry {
  private allocated: Map<string, number> = new Map();
  private nextPort: number = MIN_PORT;

  allocate(deploymentId: string): number {
    if (this.allocated.has(deploymentId)) {
      return this.allocated.get(deploymentId)!;
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

  get(deploymentId: string): number | undefined {
    return this.allocated.get(deploymentId);
  }

  release(deploymentId: string): void {
    this.allocated.delete(deploymentId);
  }

  isPortInUse(port: number): boolean {
    return [...this.allocated.values()].includes(port);
  }
}

export const portRegistry = new PortRegistry();
