import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomUUID } from 'node:crypto';
import { eras, historicalLocations, occupations } from '@pastlife/content';
import { ASSESSMENT_REPOSITORY, type AssessmentRepository } from '../repositories/assessment.repository.js';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GOOGLE_IDENTITY_PROVIDER, type GoogleIdentityProvider } from '../providers/google.provider.js';
type User = { id: string; email: string; name: string };
@Injectable()
export class AuthService {
  private readonly users = new Map<string, User>();
  private readonly archives = new Map<string, Set<string>>();
  constructor(@Inject(ASSESSMENT_REPOSITORY) private readonly repository: AssessmentRepository, @Inject(PrismaService) private readonly prisma: PrismaService, @Inject(GOOGLE_IDENTITY_PROVIDER) private readonly google: GoogleIdentityProvider) {}
  async exchange(idToken: string) {
    const identity = await this.google.verify(idToken);
    const { email } = identity;
    const found = [...this.users.values()].find((u) => u.email === email);
    let user: User = found ?? { id: randomUUID(), email, name: identity.name };
    if (this.dbEnabled) {
      const rows = await this.prisma.$queryRawUnsafe<User[]>('SELECT id, email, "displayName" as name FROM users WHERE email = $1 LIMIT 1', email);
      user = rows[0] ?? user;
      if (!rows[0]) await this.prisma.$executeRawUnsafe('INSERT INTO users (id, email, "displayName", provider, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,NOW(),NOW())', user.id, user.email, user.name, 'google');
    } else if (!found) this.users.set(user.id, user);
    return { accessToken: this.sign(user.id), user };
  }
  archive(resultId: string, token: string) { const userId = this.verify(token); return this.repository.getResult(resultId).then(async (result) => { if (!result) throw new BadRequestException({ code: 'RESULT_NOT_FOUND', message: 'Result not found' }); if (this.dbEnabled) await this.prisma.$executeRawUnsafe('INSERT INTO archive_entries (id, "userId", "resultId", "createdAt") VALUES ($1,$2,$3,NOW()) ON CONFLICT ("userId", "resultId") DO NOTHING', randomUUID(), userId, resultId); else { const set = this.archives.get(userId) ?? new Set<string>(); set.add(resultId); this.archives.set(userId, set); } return { resultId, saved: true }; }); }
  async list(token: string) { const userId = this.verify(token); const ids = this.dbEnabled ? (await this.prisma.$queryRawUnsafe<Array<{ resultId: string; createdAt: Date }>>('SELECT "resultId" as "resultId", "createdAt" as "createdAt" FROM archive_entries WHERE "userId" = $1 ORDER BY "createdAt" DESC', userId)).map((r) => ({ resultId: r.resultId, createdAt: r.createdAt })) : [...(this.archives.get(userId) ?? [])].map((resultId) => ({ resultId, createdAt: new Date() })); const items = []; for (const entry of ids) { const result = await this.repository.getResult(entry.resultId); if (!result) continue; const era = eras.find((e) => e.id === result.core.eraId); const location = historicalLocations.find((l) => l.id === result.core.locationId); const occupation = occupations.find((o) => o.id === result.core.occupationId); items.push({ resultId: entry.resultId, recordNo: result.core.recordNo, headline: `${era?.label ?? ''} ${location?.label ?? ''} · ${occupation?.label ?? ''}`, createdAt: entry.createdAt.toISOString() }); } return { items }; }
  private get dbEnabled() { return Boolean(process.env.DATABASE_URL && process.env.USE_IN_MEMORY_DB !== 'true'); }
  private sign(userId: string) { const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64url'); const secret = process.env.JWT_SECRET ?? 'dev-secret'; const sig = createHmac('sha256', secret).update(payload).digest('base64url'); return `${payload}.${sig}`; }
  private verify(token: string) { const [payload, sig] = token.split('.'); const secret = process.env.JWT_SECRET ?? 'dev-secret'; if (!payload || !sig || createHmac('sha256', secret).update(payload).digest('base64url') !== sig) throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Valid bearer token required' }); const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { sub: string; exp: number }; if (parsed.exp < Date.now() / 1000) throw new UnauthorizedException({ code: 'TOKEN_EXPIRED', message: 'Token expired' }); return parsed.sub; }
}
