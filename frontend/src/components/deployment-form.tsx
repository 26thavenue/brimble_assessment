import { useState } from 'react'

interface DeploymentFormProps {
  onSubmit: (gitUrl: string) => void
  onUpload: (file: File) => void
  isLoading: boolean
}

export function DeploymentForm({
  onSubmit,
  onUpload,
  isLoading,
}: DeploymentFormProps) {
  const [gitUrl, setGitUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (gitUrl.trim()) {
      onSubmit(gitUrl.trim())
      setGitUrl('')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
    }
  }

  const handleUpload = () => {
    if (file) {
      onUpload(file)
      setFile(null)
    }
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-2">Create Deployment</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Deploy from a Git repository or upload project files
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="git-url">
            Git URL
          </label>
          <input
            id="git-url"
            type="url"
            placeholder="https://github.com/username/repo"
            value={gitUrl}
            onChange={(e) => setGitUrl(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!gitUrl.trim() || isLoading}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Deploy from Git'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="file-upload">
            Upload Project
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".zip,.tar,.gz"
            onChange={handleFileChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4"
          />
        </div>
        <button
          type="button"
          variant="outline"
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
        >
          {isLoading ? 'Uploading...' : 'Upload & Deploy'}
        </button>
      </form>
    </div>
  )
}
