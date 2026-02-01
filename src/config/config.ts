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
};