export const RELEASE_CONTENT_VERSION = '3.0.0';

export function resolveContentRuntimeConfig(env: NodeJS.ProcessEnv = process.env) {
  const contentVersion = env.CONTENT_VERSION ?? RELEASE_CONTENT_VERSION;
  if (env.NODE_ENV === 'production' && contentVersion !== RELEASE_CONTENT_VERSION) {
    throw new Error(`CONTENT_VERSION must be ${RELEASE_CONTENT_VERSION} in production`);
  }
  return { contentVersion };
}
