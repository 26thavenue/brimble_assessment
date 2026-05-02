import { EventEmitter } from 'events';
import { deploymentRepository } from '../repositories/index.js';
class LogEmitterService {
    emitter = new EventEmitter();
    subscribers = new Map();
    emitLog(deploymentId, message) {
        const log = deploymentRepository.addLog(deploymentId, message);
        this.emitter.emit(`log:${deploymentId}`, log);
        return log;
    }
    subscribe(deploymentId, callback) {
        const subscriber = { callback, closed: false };
        const subs = this.subscribers.get(deploymentId) || [];
        subs.push(subscriber);
        this.subscribers.set(deploymentId, subs);
        const onLog = (log) => {
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
            }
            else {
                this.subscribers.set(deploymentId, remaining);
            }
        };
    }
    getExistingLogs(deploymentId) {
        return deploymentRepository.getLogs(deploymentId);
    }
}
export const logEmitterService = new LogEmitterService();
