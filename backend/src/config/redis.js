const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;

const connectRedis = async () => {
  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redis.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redis.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    return redis;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    // Don't exit process, app can work without Redis
    return null;
  }
};

const getRedis = () => {
  if (!redis) {
    throw new Error('Redis not initialized');
  }
  return redis;
};

module.exports = connectRedis;
module.exports.getRedis = getRedis;
module.exports.redis = redis;
