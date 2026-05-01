import type { Deployment, DeploymentStatus } from '@/lib/mock-api'

interface DeploymentListProps {
  deployments: Deployment[]
  selectedId?: string
  onSelect: (id: string) => void
  isLoading: boolean
}

const statusColors: Record<DeploymentStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-700' },
  building: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  deploying: { bg: 'bg-blue-100', text: 'text-blue-700' },
  running: { bg: 'bg-green-100', text: 'text-green-700' },
  failed: { bg: 'bg-red-100', text: 'text-red-700' },
}

export function DeploymentList({
  deployments,
  selectedId,
  onSelect,
  isLoading,
}: DeploymentListProps) {
  if (isLoading && deployments.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Deployments</h2>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (deployments.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Deployments</h2>
        <p className="text-sm text-muted-foreground">
          No deployments yet. Create one above to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Deployments</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Image Tag</th>
              <th className="pb-2 font-medium">Live URL</th>
              <th className="pb-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((deployment) => {
              const colors = statusColors[deployment.status]
              const isSelected = selectedId === deployment.id

              return (
                <tr
                  key={deployment.id}
                  onClick={() => onSelect(deployment.id)}
                  className={`border-b cursor-pointer hover:bg-muted/50 ${
                    isSelected ? 'bg-muted' : ''
                  }`}
                >
                  <td className="py-3 font-medium">{deployment.name}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
                    >
                      {deployment.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-xs">
                    {deployment.imageTag || '-'}
                  </td>
                  <td className="py-3">
                    {deployment.liveUrl ? (
                      <a
                        href={deployment.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {deployment.liveUrl}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(deployment.createdAt).toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
