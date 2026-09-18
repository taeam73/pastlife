import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const envPath = resolve(process.cwd(), '.env');
const source = await readFile(envPath, 'utf8');
const newline = source.includes('\r\n') ? '\r\n' : '\n';
const lines = source.split(/\r?\n/);

function readValue(name) {
  const line = lines.find((candidate) => candidate.startsWith(`${name}=`));
  if (!line) return undefined;
  const raw = line.slice(name.length + 1).trim();
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1);
  }
  return raw;
}

function setValue(name, value) {
  const index = lines.findIndex((candidate) => candidate.startsWith(`${name}=`));
  const next = `${name}=${value}`;
  if (index >= 0) lines[index] = next;
  else lines.splice(1, 0, next);
}

const configuredRuntime = readValue('DATABASE_URL');
const configuredDirect = readValue('DIRECT_URL');
const configuredUnpooled = readValue('DATABASE_URL_UNPOOLED');
const sourceUrl = configuredUnpooled ?? configuredDirect ?? configuredRuntime;

if (!sourceUrl) throw new Error('DATABASE_URL or DIRECT_URL is required in .env');

const directUrl = new URL(sourceUrl);
if (!['postgres:', 'postgresql:'].includes(directUrl.protocol)) {
  throw new Error('Neon URL must use postgres:// or postgresql://');
}
if (!directUrl.hostname.endsWith('.neon.tech')) {
  throw new Error('The configured database URL is not a Neon endpoint');
}

directUrl.hostname = directUrl.hostname.replace('-pooler.', '.');
const pooledUrl = new URL(directUrl);
const firstHostLabel = pooledUrl.hostname.split('.')[0];
pooledUrl.hostname = pooledUrl.hostname.replace(firstHostLabel, `${firstHostLabel}-pooler`);

if (directUrl.searchParams.get('sslmode') !== 'require') {
  directUrl.searchParams.set('sslmode', 'require');
}
if (pooledUrl.searchParams.get('sslmode') !== 'require') {
  pooledUrl.searchParams.set('sslmode', 'require');
}

setValue('DATABASE_URL', pooledUrl.toString());
setValue('DIRECT_URL', directUrl.toString());
await writeFile(envPath, `${lines.join(newline).replace(/(?:\r?\n)+$/, '')}${newline}`, 'utf8');

console.log('Configured Neon pooled runtime URL and direct Prisma CLI URL in .env');
