const { Pool } = require('pg');
const redis = require('redis');

// PostgreSQL Connection Pool
const pgPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'shivanya_kirana_erp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  min: process.env.DB_POOL_MIN || 2,
  max: process.env.DB_POOL_MAX || 10,
});

pgPool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Redis Client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.connect().catch(console.error);

module.exports = {
  pgPool,
  redisClient,
  query: (text, params) => pgPool.query(text, params),
};
