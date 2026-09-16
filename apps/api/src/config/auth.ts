export type GoogleAuthMode = 'mock' | 'google';

export interface AuthRuntimeConfig {
  googleMode: GoogleAuthMode;
  googleClientIds: string[];
  jwtSecret: string;
}

function parseClientIds(env: NodeJS.ProcessEnv): string[] {
  return (env.GOOGLE_CLIENT_IDS ?? env.GOOGLE_CLIENT_ID ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export function resolveAuthRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
): AuthRuntimeConfig {
  const production = env.NODE_ENV === 'production';
  const mock = env.USE_MOCK_GOOGLE === 'true';
  const googleClientIds = parseClientIds(env);
  const jwtSecret = env.JWT_SECRET ?? (production ? '' : 'dev-secret');

  if (production && mock) {
    throw new Error('USE_MOCK_GOOGLE=true is not allowed in production');
  }
  if (!mock && googleClientIds.length === 0) {
    throw new Error('GOOGLE_CLIENT_IDS or GOOGLE_CLIENT_ID is required when Google auth is enabled');
  }
  if (production && (jwtSecret.length < 32 || /^replace/i.test(jwtSecret))) {
    throw new Error('JWT_SECRET must be a non-placeholder value with at least 32 characters in production');
  }

  return {
    googleMode: mock ? 'mock' : 'google',
    googleClientIds,
    jwtSecret,
  };
}
