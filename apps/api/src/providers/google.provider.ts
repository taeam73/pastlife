export const GOOGLE_IDENTITY_PROVIDER = Symbol('GOOGLE_IDENTITY_PROVIDER');
export type GoogleIdentity = { sub: string; email: string; name: string };
export interface GoogleIdentityProvider { verify(idToken: string): Promise<GoogleIdentity>; }
