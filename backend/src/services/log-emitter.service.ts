import { EventEmitter } from 'events';
import { deploymentRepository } from '../repositories/index.js';
import type { DeploymentLog } from '../db/schema.js';

interface LogSubscriber {
  callback: (log: DeploymentLog) => void;
  closed: boolean;
}

class LogEmitterService {
  private emitter = new EventEmitter();
  private subscribers: Map<string, LogSubscriber[]> = new Map();

  emitLog(deploymentId: string, message: string): DeploymentLog {
    const log = deploymentRepository.addLog(deploymentId, message);
    this.emitter.emit(`log:${deploymentId}`, log);
    return log;
  }

  subscribe(deploymentId: string, callback: (log: DeploymentLog) => void): () => void {
    const subscriber: LogSubscriber = { callback, closed: false };
    const subs = this.subscribers.get(deploymentId) || [];
    subs.push(subscriber);
    this.subscribers.set(deploymentId, subs);

    const onLog = (log: DeploymentLog) => {
      if (!subscriber.closed) {
        callback(log);
      }
    };

    this.emitter.on(`log:${deploymentId}`, onLog);

    return () => {
      subscriber.closed = true;
      this.emitter.off(`log:${deploymentId}`, onLog);
      const remaining = (this.subscribers.get(deploymentId) || []).filter((s) => s !== subscriber);
      if (remaining.length === 0) {
        this.subscribers.delete(deploymentId);
      } else {
        this.subscribers.set(deploymentId, remaining);
      }
    };
  }

  getExistingLogs(deploymentId: string): DeploymentLog[] {
    return deploymentRepository.getLogs(deploymentId);
  }
}

export const logEmitterService = new LogEmitterService();
