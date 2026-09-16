import { BadRequestException, Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { resolveAuthRuntimeConfig } from '../config/auth.js';
import type { GoogleIdentity, GoogleIdentityProvider } from './google.provider.js';

@Injectable()
export class GoogleOAuthProvider implements GoogleIdentityProvider {
  private readonly client = new OAuth2Client();

  async verify(idToken: string): Promise<GoogleIdentity> {
    try {
      const { googleClientIds } = resolveAuthRuntimeConfig();
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: googleClientIds,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email || payload.email_verified !== true) {
        throw new Error('Required Google identity claims are missing');
      }
      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email.split('@')[0] ?? 'user',
      };
    } catch {
      throw new BadRequestException({
        code: 'INVALID_GOOGLE_TOKEN',
        message: 'Google token verification failed',
      });
    }
  }
}
