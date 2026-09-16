export const AD_PROVIDER = Symbol('AD_PROVIDER');
export type AdVerification = { sessionId: string; slot: number; providerEventId: string };

export interface AdProvider {
  load(slot: number): Promise<void>;
  show(slot: number): Promise<void>;
  verifyCompletion(event: AdVerification): Promise<boolean>;
}
