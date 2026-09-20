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

function requireValue(env, name) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is required for staging`);
  return value;
}

function parseHttpsUrl(value, name) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
  if (url.protocol !== 'https:') throw new Error(`${name} must use https:// for staging`);
  if (url.username || url.password) throw new Error(`${name} must not contain embedded credentials`);
  return url;
}

function requireBucketName(value) {
  const isIpAddress = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(value);
  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(value) || value.includes('..') || isIpAddress) {
    throw new Error('S3_BUCKET must be a safe DNS-compatible bucket name');
  }
  return value;
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

  const aiImageEndpoint = parseHttpsUrl(requireValue(env, 'AI_IMAGE_API_URL'), 'AI_IMAGE_API_URL');
  requireValue(env, 'AI_IMAGE_API_KEY');
  const storageEndpoint = parseHttpsUrl(requireValue(env, 'S3_ENDPOINT'), 'S3_ENDPOINT');
  const storageRegion = requireValue(env, 'S3_REGION');
  const storageBucket = requireBucketName(requireValue(env, 'S3_BUCKET'));
  requireValue(env, 'S3_ACCESS_KEY');
  requireValue(env, 'S3_SECRET_KEY');

  return {
    runtimeHost: runtime.hostname,
    migrationHost: migration.hostname,
    provider: runtimeIsNeon ? 'neon' : 'postgresql',
    contentVersion: env.CONTENT_VERSION,
    aiImageEndpointHost: aiImageEndpoint.hostname,
    storageEndpointHost: storageEndpoint.hostname,
    storageBucket,
    storageRegion,
  };
}
