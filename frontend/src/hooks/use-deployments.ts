import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDeployments,
  getDeployment,
  createDeployment,
  createDeploymentUpload,
  getLogs,
  type Deployment,
} from '@/lib/mock-api';

export const DEPLOYMENTS_KEY = ['deployments'];

export function useDeployments() {
  return useQuery({
    queryKey: DEPLOYMENTS_KEY,
    queryFn: getDeployments,
    refetchInterval: 2000,
  });
}

export function useDeployment(id: string) {
  return useQuery({
    queryKey: [...DEPLOYMENTS_KEY, id],
    queryFn: () => getDeployment(id),
    refetchInterval: 2000,
    enabled: !!id,
  });
}

export function useCreateDeployment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDeployment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPLOYMENTS_KEY });
    },
  });
}

export function useCreateDeploymentUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDeploymentUpload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPLOYMENTS_KEY });
    },
  });
}

export function useDeploymentLogs(deploymentId: string | undefined) {
  return useQuery({
    queryKey: [...DEPLOYMENTS_KEY, deploymentId, 'logs'],
    queryFn: () => (deploymentId ? getLogs(deploymentId) : []),
    refetchInterval: 1000,
    enabled: !!deploymentId,
  });
}

export function useLatestDeployment(): Deployment | undefined {
  const { data: deployments } = useDeployments();
  return deployments?.[0];
}