import { Queue } from 'bullmq';
import { REDIS_CONFIG } from './redis.js';

export const pdfQueue = new Queue('pdfQueue', {
  connection: REDIS_CONFIG,
});

const gracefulShutdown = async () => {  
    await pdfQueue.close();
    console.log('PDF Queue connection closed.');
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

