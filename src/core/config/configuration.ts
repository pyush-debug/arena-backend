export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: 'ictcomputereducation.com',
    port: 3306,
    username: 'admin2',
    password: '%JC9A4o3QvbgjXS%',
    name: 'ict_db',
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  security: {
    jwtSecret: 'arena_secure_key_123_xyz',
  },
});
