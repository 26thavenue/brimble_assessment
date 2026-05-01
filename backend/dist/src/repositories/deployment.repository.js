import { db } from '../db/index.js';
import { deployments, deploymentLogs } from '../db/schema.js';
import { eq, desc, asc } from 'drizzle-orm';
export class DeploymentRepository {
    findAll() {
        return db.select().from(deployments).orderBy(desc(deployments.createdAt)).all();
    }
    findById(id) {
        const result = db.select().from(deployments).where(eq(deployments.id, id)).get();
        return result || null;
    }
    create(input) {
        const id = crypto.randomUUID();
        const now = new Date();
        db.insert(deployments).values({
            id,
            name: input.name,
            gitUrl: input.gitUrl || null,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
        }).run();
        return this.findById(id);
    }
    update(id, input) {
        const existing = this.findById(id);
        if (!existing)
            return null;
        const updateData = {};
        if (input.status !== undefined)
            updateData.status = input.status;
        if (input.imageTag !== undefined)
            updateData.imageTag = input.imageTag || null;
        if (input.liveUrl !== undefined)
            updateData.liveUrl = input.liveUrl || null;
        if (Object.keys(updateData).length === 0)
            return existing;
        updateData.updatedAt = new Date();
        db.update(deployments)
            .set(updateData)
            .where(eq(deployments.id, id))
            .run();
        return this.findById(id);
    }
    delete(id) {
        const existing = this.findById(id);
        if (!existing)
            return false;
        db.delete(deploymentLogs).where(eq(deploymentLogs.deploymentId, id)).run();
        db.delete(deployments).where(eq(deployments.id, id)).run();
        return true;
    }
    getLogs(deploymentId) {
        return db.select()
            .from(deploymentLogs)
            .where(eq(deploymentLogs.deploymentId, deploymentId))
            .orderBy(asc(deploymentLogs.createdAt))
            .all();
    }
    addLog(deploymentId, message) {
        const now = new Date();
        const result = db.insert(deploymentLogs).values({
            deploymentId,
            message,
            createdAt: now,
        }).returning().get();
        return result;
    }
}
export const deploymentRepository = new DeploymentRepository();
