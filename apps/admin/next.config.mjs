import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDirectory = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve(appDirectory, '../..'),
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
