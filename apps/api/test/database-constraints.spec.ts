import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const schema = readFileSync(new URL('../../../prisma/schema.prisma', import.meta.url), 'utf8');

describe('Prisma constraint contract', () => {
  it('declares the idempotency and duplicate-prevention constraints', () => {
    expect(schema).toContain('@@id([sessionId, stage])');
    expect(schema).toContain('@@unique([sessionId, unlockType])');
    expect(schema).toMatch(/providerEventId\s+String\s+@unique/);
    expect(schema).toContain('@@index([answerHash, contentVersion])');
  });
});
