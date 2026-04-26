import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface DeploymentFormProps {
  onSubmit: (gitUrl: string) => void;
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export function DeploymentForm({
  onSubmit,
  onUpload,
  isLoading,
}: DeploymentFormProps) {
  const [gitUrl, setGitUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gitUrl.trim()) {
      onSubmit(gitUrl.trim());
      setGitUrl('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file);
      setFile(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Deployment</CardTitle>
        <CardDescription>
          Deploy from a Git repository or upload project files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="git-url">Git URL</Label>
            <Input
              id="git-url"
              placeholder="https://github.com/username/repo"
              value={gitUrl}
              onChange={(e) => setGitUrl(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={!gitUrl.trim() || isLoading}>
            {isLoading ? 'Creating...' : 'Deploy from Git'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload Project</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".zip,.tar,.gz"
              onChange={handleFileChange}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleUpload}
            disabled={!file || isLoading}
          >
            {isLoading ? 'Uploading...' : 'Upload & Deploy'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}