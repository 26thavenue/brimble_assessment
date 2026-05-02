import express from 'express';
import cors from 'cors';
import { config } from './src/config/index.js';
import { closeDb } from './src/db/index.js';
import { errorHandler, notFoundHandler } from './src/middleware/index.js';
import { createDeploymentRouter, createHealthRouter } from './src/routes/index.js';
const app = express();
app.use(cors({ origin: config.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use('/health', createHealthRouter());
app.use('/api/deployments', createDeploymentRouter());
app.use(notFoundHandler);
app.use(errorHandler);
async function start() {
    try {
        console.log('Database connected successfully');
        app.listen(config.PORT, () => {
            console.log(`Server running on port ${config.PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    closeDb();
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    closeDb();
    process.exit(0);
});
start();
