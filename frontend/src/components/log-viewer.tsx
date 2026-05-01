import { useEffect, useRef, useState } from 'react'
import { useDeployments, useDeploymentLogs } from '@/hooks/use-deployments'

interface LogViewerProps {
  deploymentId?: string
}

export function LogViewer({ deploymentId }: LogViewerProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const { data: deployments } = useDeployments()
  const { data: logs = [] } = useDeploymentLogs(deploymentId)

  const selectedDeployment = deployments?.find((d) => d.id === deploymentId)

  useEffect(() => {
    if (isExpanded && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, isExpanded])

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50"
      >
        <h2 className="text-xl font-semibold">Build Logs</h2>
        <span className="text-sm text-muted-foreground">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t px-4 py-4">
          {!deploymentId ? (
            <p className="text-sm text-muted-foreground">
              Select a deployment to view logs.
            </p>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                {selectedDeployment?.name} ({selectedDeployment?.status})
              </p>
              <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-lg max-h-80 overflow-y-auto">
                {logs.length === 0 ? (
                  <span className="text-gray-500">Waiting for logs...</span>
                ) : (
                  logs.map((log, i) => <div key={i}>{log}</div>)
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
