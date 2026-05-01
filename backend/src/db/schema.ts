import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const deployments = sqliteTable('deployments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  gitUrl: text('gitUrl'),
  status: text('status', { enum: ['pending', 'building', 'deploying', 'running', 'failed'] }).notNull().default('pending'),
  imageTag: text('imageTag'),
  liveUrl: text('liveUrl'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const deploymentLogs = sqliteTable('deployment_logs', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  deploymentId: text('deploymentId').notNull().references(() => deployments.id),
  message: text('message').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export type Deployment = typeof deployments.$inferSelect;
export type NewDeployment = typeof deployments.$inferInsert;
export type DeploymentLog = typeof deploymentLogs.$inferSelect;
