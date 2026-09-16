export const IMAGE_STORAGE = Symbol('IMAGE_STORAGE');
export interface ImageStorage { putObject(key: string, body: Uint8Array, contentType: string): Promise<string>; }
