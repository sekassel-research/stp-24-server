const port = +(process.env.PORT || 3000);

export const environment = {
  version: process.env.API_VERSION || 'v4',
  nodeEnv: process.env.NODE_ENV || 'development',
  port,
  baseUrl: process.env.BASE_URL || `http://localhost:${port}`,
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/stp-24',
  },
  auth: {
    secret: process.env.AUTH_SECRET || 'secret',
    algorithms: (process.env.AUTH_ALGORITHMS || 'RS256').split(','),
    issuer: process.env.AUTH_ISSUER || 'https://se.uniks.de/auth/realms/STP',
    expiry: '1h',
    refreshExpiry: '28 days',
  },
  rateLimit: {
    ttl: +(process.env.RATE_LIMIT_TTL || 60),
    limit: +(process.env.RATE_LIMIT || 60),
    presetsTtl: +(process.env.RATE_LIMIT_PRESETS_TTL || 60),
  },
  passive: !!process.env.PASSIVE,
  cleanup: {
    tempUserLifetimeHours: +(process.env.TEMP_USER_LIFETIME_HOURS || 1),
    tempUserNamePattern: process.env.TEMP_USER_NAME_PATTERN
      ? new RegExp(process.env.TEMP_USER_NAME_PATTERN)
      // 'temp'/'test' or variations, single letters, ending with a number,
      // or repeating sequences of 1-3 characters at least 3 times,
      // or not starting with a word character (ASCII sort cheating)
      : /t[e3]mp|t[e3][s5]t|^.$|\d+$|^(.{1,3})\1{2,}$|^\W/i,
    globalMessageLifetimeHours: +(process.env.GLOBAL_MESSAGE_LIFETIME_HOURS || 4),
    orphanMessageLifetimeHours: +(process.env.ORPHAN_MESSAGE_LIFETIME_HOURS || 1),
    spamMessageLifetimeHours: +(process.env.SPAM_MESSAGE_LIFETIME_HOURS || 1),
    spamMessagePattern: process.env.SPAM_MESSAGE_PATTERN
      ? new RegExp(process.env.SPAM_MESSAGE_PATTERN)
      : /^.$|(.{1,3})\1{2,}|^This message was deleted$/,
    gameLifetimeHours: +(process.env.GAME_LIFETIME_HOURS || 24 * 2), // 2 days
  },
  nats: {
    servers: process.env.NATS_URL || 'nats://localhost:4222',
  },
  sentry: {
    enabled: !!process.env.SENTRY_DSN && (process.env.SENTRY_ENABLED === 'true' || process.env.NODE_ENV === 'production'),
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: +(process.env.SENTRY_TRACES_SAMPLE_RATE || 1),
  },
};
