import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
};
const redis = new IORedis(REDIS_CONFIG);

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export { redis, REDIS_CONFIG };
