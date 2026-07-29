export interface AppConfig {
  app: {
    name: string;
    port: number;
    env: string;
    corsOrigins: string[];
  };
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  redis: {
    url?: string;
  };
  jwt: {
    secret?: string;
    publicKey?: string;
    privateKey?: string;
    expiresIn: string;
  };
  refresh: {
    secret: string;
    expiresIn: string;
  };
  security: {
    loginThrottleLimit: number;
    loginThrottleTtlSeconds: number;
    maxFailedLoginAttempts: number;
    accountLockMinutes: number;
    passwordResetTokenTtlMinutes: number;
  };
}

const toList = (value: string | undefined): string[] =>
  (value ?? '*')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export default (): AppConfig => ({
  app: {
    name: process.env.APP_NAME ?? 'AuthForge',
    port: parseInt(process.env.PORT ?? '3000', 10),
    env: process.env.NODE_ENV ?? 'development',
    corsOrigins: toList(process.env.CORS_ORIGINS),
  },
  database: {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    username: process.env.POSTGRES_USER ?? 'authforge',
    password: process.env.POSTGRES_PASSWORD ?? 'authforge',
    name: process.env.POSTGRES_DB ?? 'authforge',
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    publicKey: process.env.JWT_PUBLIC_KEY,
    privateKey: process.env.JWT_PRIVATE_KEY,
    expiresIn: process.env.JWT_EXPIRES ?? '15m',
  },
  refresh: {
    secret: process.env.REFRESH_SECRET ?? process.env.JWT_SECRET ?? '',
    expiresIn: process.env.REFRESH_EXPIRES ?? '7d',
  },
  security: {
    loginThrottleLimit: parseInt(process.env.LOGIN_THROTTLE_LIMIT ?? '5', 10),
    loginThrottleTtlSeconds: parseInt(process.env.LOGIN_THROTTLE_TTL ?? '60', 10),
    maxFailedLoginAttempts: parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS ?? '5', 10),
    accountLockMinutes: parseInt(process.env.ACCOUNT_LOCK_MINUTES ?? '15', 10),
    passwordResetTokenTtlMinutes: parseInt(
      process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? '60',
      10,
    ),
  },
});
