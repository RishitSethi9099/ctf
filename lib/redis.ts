
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create a Redis client instance
const redis = new Redis(REDIS_URL);

export default redis;
