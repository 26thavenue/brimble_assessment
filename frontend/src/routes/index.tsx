import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DeploymentForm } from '@/components/deployment-form'
import { DeploymentList } from '@/components/deployment-list'
import { LogViewer } from '@/components/log-viewer'
import {
  useDeployments,
  useCreateDeployment,
  useCreateDeploymentUpload,
} from '@/hooks/use-deployments'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { data: deployments = [], isLoading } = useDeployments()
  const createDeployment = useCreateDeployment()
  const createUpload = useCreateDeploymentUpload()
  const [selectedId, setSelectedId] = useState<string | undefined>()

  const handleSubmit = (gitUrl: string) => {
    createDeployment.mutate(gitUrl)
  }

  const handleUpload = (file: File) => {
    createUpload.mutate(file)
  }

  const isPending = createDeployment.isPending || createUpload.isPending

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Brimble Deployments</h1>
          <p className="text-muted-foreground mt-2">
            Deploy your applications with ease
          </p>
        </header>

        <DeploymentForm
          onSubmit={handleSubmit}
          onUpload={handleUpload}
          isLoading={isPending}
        />

        <DeploymentList
          deployments={deployments}
          selectedId={selectedId}
          onSelect={setSelectedId}
          isLoading={isLoading}
        />

        <LogViewer deploymentId={selectedId} />
      </div>
    </div>
  )
}
