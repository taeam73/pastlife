import { inspectStagingEnv } from './staging-env.mjs';

const result = inspectStagingEnv(process.env);
console.log(`Staging database preflight passed: ${result.provider}`);
console.log(`Runtime host: ${result.runtimeHost}`);
console.log(`Migration host: ${result.migrationHost}`);
console.log(`Content version: ${result.contentVersion}`);
console.log(`AI image endpoint host: ${result.aiImageEndpointHost}`);
console.log(`Storage endpoint host: ${result.storageEndpointHost}`);
console.log(`Storage bucket: ${result.storageBucket}`);
console.log(`Storage region: ${result.storageRegion}`);
