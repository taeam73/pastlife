import type { ResultCore } from '@pastlife/scoring';

export const IMAGE_PROVIDER = Symbol('IMAGE_PROVIDER');
export type ImageAsset = { sourceType: 'LIBRARY'; uri: string; alt: string };
export interface ImageProvider { getImage(core: ResultCore): Promise<ImageAsset> }
