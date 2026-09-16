import { BadRequestException, Injectable } from '@nestjs/common';
import type { GoogleIdentity, GoogleIdentityProvider } from './google.provider.js';
@Injectable()
export class MockGoogleProvider implements GoogleIdentityProvider {
  async verify(idToken: string): Promise<GoogleIdentity> {
    if (!idToken.startsWith('mock-google:')) throw new BadRequestException({ code: 'GOOGLE_TOKEN_UNSUPPORTED', message: 'Google token verification provider is not configured' });
    const email = idToken.slice('mock-google:'.length);
    if (!email.includes('@')) throw new BadRequestException({ code: 'INVALID_GOOGLE_TOKEN', message: 'Invalid Google token' });
    return { sub: `mock:${email}`, email, name: email.split('@')[0] ?? 'user' };
  }
}
