export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    name: process.env.DB_NAME || 'arena_os_v2',
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  security: {
    jwtSecret: 'arena_secure_key_123_xyz',
  },
});
