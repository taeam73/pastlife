import { beforeEach, describe, expect, it, vi } from 'vitest';

const verifyIdToken = vi.fn();
vi.mock('google-auth-library', () => ({
  OAuth2Client: class {
    verifyIdToken = verifyIdToken;
  },
}));

import { GoogleOAuthProvider } from '../src/providers/google-oauth.provider.js';

describe('GoogleOAuthProvider', () => {
  beforeEach(() => {
    verifyIdToken.mockReset();
    process.env.GOOGLE_CLIENT_IDS = 'web-client,ios-client';
    process.env.USE_MOCK_GOOGLE = 'false';
  });

  it('verifies an ID token against every configured audience', async () => {
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({ sub: 'google-subject', email: 'person@example.com', email_verified: true, name: 'Person' }),
    });
    await expect(new GoogleOAuthProvider().verify('id-token')).resolves.toEqual({
      sub: 'google-subject',
      email: 'person@example.com',
      name: 'Person',
    });
    expect(verifyIdToken).toHaveBeenCalledWith({ idToken: 'id-token', audience: ['web-client', 'ios-client'] });
  });

  it('rejects identities without a verified email', async () => {
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({ sub: 'google-subject', email: 'person@example.com', email_verified: false }),
    });
    await expect(new GoogleOAuthProvider().verify('id-token')).rejects.toMatchObject({ status: 400 });
  });
});
