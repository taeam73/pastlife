function parsePostgresUrl(value, name) {
  if (!value) throw new Error(`${name} is required for staging`);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid PostgreSQL URL`);
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error(`${name} must use postgres:// or postgresql://`);
  }
  return url;
}

function isNeon(url) {
  return url.hostname.endsWith('.neon.tech');
}

function isNeonPooler(url) {
  return isNeon(url) && url.hostname.includes('-pooler.');
}

function requireNeonTls(url, name) {
  if (url.searchParams.get('sslmode') !== 'require') {
    throw new Error(`${name} must include sslmode=require for Neon`);
  }
}

export function inspectStagingEnv(env = process.env) {
  if (env.USE_IN_MEMORY_DB !== 'false') {
    throw new Error('USE_IN_MEMORY_DB must be false for staging');
  }
  if (env.CONTENT_VERSION !== '2.5.0') {
    throw new Error('CONTENT_VERSION must be 2.5.0 for this release');
  }

  const runtime = parsePostgresUrl(env.DATABASE_URL, 'DATABASE_URL');
  const migration = parsePostgresUrl(env.DIRECT_URL, 'DIRECT_URL');
  if (runtime.href === migration.href) {
    throw new Error('DATABASE_URL and DIRECT_URL must use separate runtime and migration endpoints');
  }

  const runtimeIsNeon = isNeon(runtime);
  const migrationIsNeon = isNeon(migration);
  if (runtimeIsNeon !== migrationIsNeon) {
    throw new Error('DATABASE_URL and DIRECT_URL must use the same database provider');
  }

  if (runtimeIsNeon) {
    if (!isNeonPooler(runtime)) throw new Error('DATABASE_URL must use the Neon pooler endpoint');
    if (isNeonPooler(migration)) throw new Error('DIRECT_URL must use the Neon non-pooler endpoint');
    requireNeonTls(runtime, 'DATABASE_URL');
    requireNeonTls(migration, 'DIRECT_URL');

    const expectedDirectHost = runtime.hostname.replace('-pooler.', '.');
    if (migration.hostname !== expectedDirectHost || migration.pathname !== runtime.pathname) {
      throw new Error('DATABASE_URL and DIRECT_URL must target the same Neon database');
    }
  }

  return {
    runtimeHost: runtime.hostname,
    migrationHost: migration.hostname,
    provider: runtimeIsNeon ? 'neon' : 'postgresql',
    contentVersion: env.CONTENT_VERSION,
  };
}
