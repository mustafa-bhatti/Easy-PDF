import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, pool } from './config/db.js';
import { pdfQueue } from './config/queue.js';
import router from './routes/mainRouter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// Routes
app.use('/api', router);

const server = app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} Full URL: http://localhost:${PORT}/api`
  );
});
const shutdown = async (signal) => {
  server.close(async () => {
    console.log(`Received ${signal}. Closing server...`);
    try {
      await pdfQueue.close();
      console.log('Redis Queue closed.');
      await pool.end();
      console.log('Database connection closed.');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
