export const throttlerConfig = {
  global: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
  },
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  accessTokenExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
}

export const databaseConfig = {
  url: process.env.DATABASE_URL || 'postgresql://localhost:5432/mydb',
};

export const appConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  prefixApi: process.env.PREFIX_API || '/api/v1',
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '10000', 10),
};

export const corsConfig = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: process.env.CORS_CREDENTIALS === 'true',
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization',
  exposedHeaders: process.env.CORS_EXPOSED_HEADERS || '',
  maxAge: parseInt(process.env.CORS_MAX_AGE || '3600', 10),
};