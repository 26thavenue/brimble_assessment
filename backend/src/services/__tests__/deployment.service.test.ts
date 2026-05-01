import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeploymentService } from '../deployment.service.js';
import { deploymentRepository } from '../../repositories/index.js';
import type { DeploymentStatus } from '../../types/index.js';

// Mock the deploymentRepository module
vi.mock('../../repositories/index.js', () => ({
  deploymentRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getLogs: vi.fn(),
    addLog: vi.fn(),
  },
}));

describe('DeploymentService', () => {
  let service: DeploymentService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DeploymentService();
    // Prevent simulateDeploymentProcess from actually waiting in tests
    vi.spyOn(service as any, 'simulateDeploymentProcess').mockImplementation(async () => {});
  });

  describe('getAllDeployments', () => {
    it('should return all deployments from the repository', () => {
      const mockDeployments = [{ id: '1', name: 'app' }];
      vi.mocked(deploymentRepository.findAll).mockReturnValue(mockDeployments as any);

      const result = service.getAllDeployments();

      expect(deploymentRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockDeployments);
    });
  });

  describe('getDeploymentById', () => {
    it('should return a deployment by id', () => {
      const mockDeployment = { id: '1', name: 'app' };
      vi.mocked(deploymentRepository.findById).mockReturnValue(mockDeployment as any);

      const result = service.getDeploymentById('1');

      expect(deploymentRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockDeployment);
    });
  });

  describe('createDeployment', () => {
    it('should extract name from gitUrl if not provided', () => {
      const mockDeployment = { id: '1', name: 'my-repo', gitUrl: 'https://github.com/user/my-repo.git' };
      vi.mocked(deploymentRepository.create).mockReturnValue(mockDeployment as any);

      const result = service.createDeployment({ gitUrl: 'https://github.com/user/my-repo.git', name: '' });

      expect(deploymentRepository.create).toHaveBeenCalledWith({
        name: 'my-repo',
        gitUrl: 'https://github.com/user/my-repo.git',
      });
      expect(result).toEqual(mockDeployment);
    });

    it('should use provided name over gitUrl extraction', () => {
      const mockDeployment = { id: '1', name: 'custom-name', gitUrl: 'https://github.com/user/my-repo.git' };
      vi.mocked(deploymentRepository.create).mockReturnValue(mockDeployment as any);

      const result = service.createDeployment({ gitUrl: 'https://github.com/user/my-repo.git', name: 'custom-name' });

      expect(deploymentRepository.create).toHaveBeenCalledWith({
        name: 'custom-name',
        gitUrl: 'https://github.com/user/my-repo.git',
      });
    });
  });

  describe('updateDeploymentStatus', () => {
    it('should update status and add a log entry', () => {
      const mockDeployment = { id: '1', status: 'building' };
      vi.mocked(deploymentRepository.update).mockReturnValue(mockDeployment as any);

      const result = service.updateDeploymentStatus('1', 'building');

      expect(deploymentRepository.update).toHaveBeenCalledWith('1', {
        status: 'building',
        imageTag: undefined,
        liveUrl: undefined,
      });
      expect(deploymentRepository.addLog).toHaveBeenCalledWith('1', '[BUILDING] Status updated to building');
      expect(result).toEqual(mockDeployment);
    });
  });

  describe('deleteDeployment', () => {
    it('should call repository delete and return result', () => {
      vi.mocked(deploymentRepository.delete).mockReturnValue(true);

      const result = service.deleteDeployment('1');

      expect(deploymentRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });
  });
});
