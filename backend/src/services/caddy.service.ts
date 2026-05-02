const CADDY_ADMIN_URL = process.env.CADDY_ADMIN_URL || 'http://caddy:2019';

export class CaddyService {
  async addRoute(deploymentId: string, port: number): Promise<void> {
    const path = `/deploy/${deploymentId}`;
    const config = {
      handler: 'reverse_proxy',
      upstreams: [{ dial: `host.docker.internal:${port}` }],
    };

    try {
      await fetch(`${CADDY_ADMIN_URL}/id/deployments/config/apps/http/servers/srv0/routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: [config],
          match: [{ path: [`${path}`, `${path}/*`] }],
          terminal: true,
        }),
      });
    } catch (error) {
      console.error(`Failed to add Caddy route for ${deploymentId}:`, error);
    }
  }

  async removeRoute(deploymentId: string): Promise<void> {
    const path = `/deploy/${deploymentId}`;

    try {
      const res = await fetch(`${CADDY_ADMIN_URL}/id/deployments/config/apps/http/servers/srv0/routes`);
      if (!res.ok) return;

      const routes: any[] = await res.json();
      for (const route of routes) {
        const matchers = route.match?.[0]?.path || [];
        if (matchers.includes(path) || matchers.includes(`${path}/*`)) {
          await fetch(`${CADDY_ADMIN_URL}/id/deployments/config/apps/http/servers/srv0/routes/${route['@id'] || ''}`, {
            method: 'DELETE',
          });
          break;
        }
      }
    } catch (error) {
      console.error(`Failed to remove Caddy route for ${deploymentId}:`, error);
    }
  }
}

export const caddyService = new CaddyService();
