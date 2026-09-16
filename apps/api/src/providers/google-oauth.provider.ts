import { BadRequestException, Injectable } from '@nestjs/common';
import type { GoogleIdentity, GoogleIdentityProvider } from './google.provider.js';

@Injectable()
export class GoogleOAuthProvider implements GoogleIdentityProvider {
  async verify(idToken: string): Promise<GoogleIdentity> {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!response.ok) throw new BadRequestException({ code: 'INVALID_GOOGLE_TOKEN', message: 'Google token verification failed' });
    const body = (await response.json()) as { sub?: string; email?: string; name?: string; aud?: string; email_verified?: string };
    if (!body.sub || !body.email || body.email_verified === 'false' || (process.env.GOOGLE_CLIENT_ID && body.aud !== process.env.GOOGLE_CLIENT_ID)) throw new BadRequestException({ code: 'INVALID_GOOGLE_TOKEN', message: 'Google token claims are invalid' });
    return { sub: body.sub, email: body.email, name: body.name ?? body.email.split('@')[0] ?? 'user' };
  }
}
