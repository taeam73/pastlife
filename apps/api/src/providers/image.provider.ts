import type { ResultCore } from '@pastlife/scoring';

export const IMAGE_PROVIDER = Symbol('IMAGE_PROVIDER');
export type ImageAsset = {
  sourceType: 'AI' | 'LIBRARY';
  uri: string;
  alt: string;
  status: 'READY' | 'FALLBACK';
  attemptCount: number;
  errorCode?: string;
};
export interface ImageProvider { getImage(core: ResultCore): Promise<ImageAsset> }
