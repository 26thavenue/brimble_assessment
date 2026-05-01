export type DeploymentStatus =
  | 'pending'
  | 'building'
  | 'deploying'
  | 'running'
  | 'failed'

export interface Deployment {
  id: string
  name: string
  gitUrl?: string
  status: DeploymentStatus
  imageTag?: string
  liveUrl?: string
  createdAt: Date
  logs: string[]
}

const deployments: Deployment[] = [
  {
    id: '1',
    name: 'example-app',
    gitUrl: 'https://github.com/_example/demo-app',
    status: 'running',
    imageTag: 'demo-app:v1.0.0',
    liveUrl: 'http://localhost:8080',
    createdAt: new Date(Date.now() - 3600000),
    logs: [
      '[1/1] Cloning repository...',
      '[2/1] Installing dependencies...',
      '[3/1] Building application...',
      '[4/1] Building Docker image...',
      '[5/1] Pushing to registry...',
      '[6/1] Starting container...',
      '✓ Deployment ready at http://localhost:8080',
    ],
  },
  {
    id: '2',
    name: 'my-api',
    gitUrl: 'https://github.com/_example/my-api',
    status: 'building',
    imageTag: undefined,
    liveUrl: undefined,
    createdAt: new Date(Date.now() - 60000),
    logs: [
      '[1/3] Cloning repository...',
      '[2/3] Installing dependencies...',
      '[3/3] Building application...',
    ],
  },
]

let nextId = 3
const logIntervals: Map<string, NodeJS.Timeout> = new Map()
const statusTimeouts: Map<string, NodeJS.Timeout> = new Map()

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function getNameFromGitUrl(gitUrl: string): string {
  const match = gitUrl.match(/\/([^/]+?)(?:\.git)?$/)
  return match ? match[1] : `deployment-${nextId}`
}

export async function getDeployments(): Promise<Deployment[]> {
  await new Promise((r) => setTimeout(r, 300))
  return [...deployments]
}

export async function getDeployment(
  id: string,
): Promise<Deployment | undefined> {
  await new Promise((r) => setTimeout(r, 200))
  return deployments.find((d) => d.id === id)
}

export async function createDeployment(gitUrl: string): Promise<Deployment> {
  await new Promise((r) => setTimeout(r, 500))

  const name = getNameFromGitUrl(gitUrl)
  const deployment: Deployment = {
    id: String(nextId++),
    name,
    gitUrl,
    status: 'pending',
    createdAt: new Date(),
    logs: ['[1/3] Cloning repository...'],
  }

  deployments.unshift(deployment)
  simulateDeployment(deployment.id, gitUrl)
  return deployment
}

function simulateDeployment(deploymentId: string, gitUrl: string): void {
  const statusSequence: DeploymentStatus[] = [
    'building',
    'deploying',
    'running',
  ]
  let step = 0

  const statusTimeout = setTimeout(() => {
    if (step >= statusSequence.length) {
      const dep = deployments.find((d) => d.id === deploymentId)
      if (dep) {
        dep.status = 'running'
        dep.imageTag = `${dep.name}:v${Date.now()}`
        dep.liveUrl = `http://localhost:${3000 + Math.floor(Math.random() * 1000)}`
      }
      return
    }

    const dep = deployments.find((d) => d.id === deploymentId)
    if (!dep) return

    dep.status = statusSequence[step]

    const logMessages: Record<DeploymentStatus, string[]> = {
      pending: ['[1/3] Cloning repository...'],
      building: [
        '[2/3] Installing dependencies...',
        '[3/3] Building application...',
      ],
      deploying: [
        '[4/4] Building Docker image...',
        '[5/4] Pushing to registry...',
        '[6/4] Starting container...',
      ],
      running: ['✓ Deployment ready'],
      failed: ['✗ Build failed'],
    }

    dep.logs.push(...logMessages[dep.status])

    step++
    statusTimeouts.set(
      deploymentId,
      setTimeout(() => simulateDeployment(deploymentId, gitUrl), 2000),
    )
  }, 1500)

  statusTimeouts.set(deploymentId, statusTimeout)
}

export async function createDeploymentUpload(file: File): Promise<Deployment> {
  await new Promise((r) => setTimeout(r, 500))

  const name = file.name.replace(/\.[^/.]+$/, '')
  const deployment: Deployment = {
    id: String(nextId++),
    name,
    gitUrl: undefined,
    status: 'pending',
    createdAt: new Date(),
    logs: ['[1/3] Reading project files...'],
  }

  deployments.unshift(deployment)
  simulateDeployment(deployment.id, 'upload')
  return deployment
}

export function subscribeToLogs(
  deploymentId: string,
  onLog: (log: string) => void,
): () => void {
  const interval = setInterval(() => {
    const dep = deployments.find((d) => d.id === deploymentId)
    if (dep && dep.logs.length > 0) {
      onLog(dep.logs[dep.logs.length - 1])
    }
  }, 500)

  logIntervals.set(`${deploymentId}-${Date.now()}`, interval)

  return () => {
    clearInterval(interval)
  }
}

export function getLogs(deploymentId: string): string[] {
  const dep = deployments.find((d) => d.id === deploymentId)
  return dep?.logs || []
}

export function clearMocks(): void {
  logIntervals.forEach(clearInterval)
  statusTimeouts.forEach(clearTimeout)
  deployments.length = 0
  nextId = 3
}
