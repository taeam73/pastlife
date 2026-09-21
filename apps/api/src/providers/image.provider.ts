import type { ResultCore } from '@pastlife/scoring';

export const IMAGE_PROVIDER = Symbol('IMAGE_PROVIDER');
export type ImageLayer = {
  uri: string;
  role: 'BACKGROUND' | 'CHARACTER' | 'EFFECT';
  alt: string;
};
export type ImageAsset = {
  sourceType: 'AI' | 'LIBRARY';
  uri: string;
  alt: string;
  status: 'READY' | 'FALLBACK';
  attemptCount: number;
  errorCode?: string;
  layers?: ImageLayer[];
  compositeUri?: string;
};
export interface ImageProvider { getImage(core: ResultCore): Promise<ImageAsset> }
