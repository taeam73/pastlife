import { hashText } from './hash.js';

export function deterministicIndex(seed: string, length: number): number {
  if (!Number.isInteger(length) || length <= 0) throw new Error('Length must be a positive integer');
  return Number.parseInt(hashText(seed).slice(0, 8), 16) % length;
}
