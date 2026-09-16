export type DatabaseMode = 'memory' | 'prisma';

export interface DatabaseRuntimeConfig {
  mode: DatabaseMode;
  provider: 'memory' | 'postgresql';
  host?: string;
  pooled: boolean;
}

function parsePostgresUrl(value: string, name: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid PostgreSQL URL`);
  }

  if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
    throw new Error(`${name} must use the postgresql:// or postgres:// protocol`);
  }
  return url;
}

function isNeonHost(hostname: string): boolean {
  return hostname.endsWith('.neon.tech');
}

function isNeonPooler(hostname: string): boolean {
  return isNeonHost(hostname) && hostname.includes('-pooler.');
}

export function resolveDatabaseRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
): DatabaseRuntimeConfig {
  const production = env.NODE_ENV === 'production';
  const explicitMemory = env.USE_IN_MEMORY_DB === 'true';

  if (explicitMemory) {
    if (production) {
      throw new Error('USE_IN_MEMORY_DB=true is not allowed in production');
    }
    return { mode: 'memory', provider: 'memory', pooled: false };
  }

  if (!env.DATABASE_URL) {
    if (production) {
      throw new Error('DATABASE_URL is required in production');
    }
    return { mode: 'memory', provider: 'memory', pooled: false };
  }

  const runtimeUrl = parsePostgresUrl(env.DATABASE_URL, 'DATABASE_URL');
  const neon = isNeonHost(runtimeUrl.hostname);
  const pooled = isNeonPooler(runtimeUrl.hostname);

  if (neon && !pooled) {
    throw new Error(
      'DATABASE_URL must use the Neon pooled endpoint; use DIRECT_URL for migrations',
    );
  }
  if (neon && runtimeUrl.searchParams.get('sslmode') !== 'require') {
    throw new Error('Neon DATABASE_URL must include sslmode=require');
  }

  return {
    mode: 'prisma',
    provider: 'postgresql',
    host: runtimeUrl.hostname,
    pooled,
  };
}
