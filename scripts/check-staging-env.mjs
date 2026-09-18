import { inspectStagingEnv } from './staging-env.mjs';

const result = inspectStagingEnv(process.env);
console.log(`Staging database preflight passed: ${result.provider}`);
console.log(`Runtime host: ${result.runtimeHost}`);
console.log(`Migration host: ${result.migrationHost}`);
console.log(`Content version: ${result.contentVersion}`);
