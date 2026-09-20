import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { eras, historicalLocations, occupations } from '@pastlife/content';
import { ASSESSMENT_REPOSITORY, type AssessmentRepository } from '../repositories/assessment.repository.js';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GOOGLE_IDENTITY_PROVIDER, type GoogleIdentityProvider } from '../providers/google.provider.js';
import { resolveAuthRuntimeConfig } from '../config/auth.js';
import { ResultsService } from '../results/results.service.js';
type User = { id: string; email: string; name: string; providerSub: string };
@Injectable()
export class AuthService {
  private readonly users = new Map<string, User>();
  private readonly archives = new Map<string, Set<string>>();
  constructor(@Inject(ASSESSMENT_REPOSITORY) private readonly repository: AssessmentRepository, @Inject(PrismaService) private readonly prisma: PrismaService, @Inject(GOOGLE_IDENTITY_PROVIDER) private readonly google: GoogleIdentityProvider, @Inject(ResultsService) private readonly results: ResultsService) {}
  async exchange(idToken: string) {
    const identity = await this.google.verify(idToken);
    const found = [...this.users.values()].find((u) => u.providerSub === identity.sub);
    let user: User = found ?? { id: randomUUID(), email: identity.email, name: identity.name, providerSub: identity.sub };
    if (this.dbEnabled) {
      const rows = await this.prisma.$queryRawUnsafe<User[]>('SELECT id, email, "displayName" as name, "providerSub" as "providerSub" FROM users WHERE provider = $1 AND "providerSub" = $2 LIMIT 1', 'google', identity.sub);
      const emailRows = rows.length === 0
        ? await this.prisma.$queryRawUnsafe<User[]>('SELECT id, email, "displayName" as name, COALESCE("providerSub", $2) as "providerSub" FROM users WHERE email = $1 LIMIT 1', identity.email, identity.sub)
        : [];
      user = rows[0] ?? emailRows[0] ?? user;
      if (rows[0] || emailRows[0]) {
        await this.prisma.$executeRawUnsafe('UPDATE users SET email = $1, "displayName" = $2, provider = $3, "providerSub" = $4, "updatedAt" = NOW() WHERE id = $5', identity.email, identity.name, 'google', identity.sub, user.id);
        user = { ...user, email: identity.email, name: identity.name, providerSub: identity.sub };
      } else {
        await this.prisma.$executeRawUnsafe('INSERT INTO users (id, email, "displayName", provider, "providerSub", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,NOW(),NOW())', user.id, user.email, user.name, 'google', user.providerSub);
      }
    } else if (!found) {
      this.users.set(user.id, user);
    } else if (found.email !== identity.email || found.name !== identity.name) {
      user = { ...found, email: identity.email, name: identity.name };
      this.users.set(user.id, user);
    }
    return { accessToken: this.sign(user.id), user: { id: user.id, email: user.email, name: user.name } };
  }
  archive(resultId: string, token: string) { const userId = this.verify(token); return this.repository.getResult(resultId).then(async (result) => { if (!result) throw new BadRequestException({ code: 'RESULT_NOT_FOUND', message: 'Result not found' }); if (this.dbEnabled) await this.prisma.$executeRawUnsafe('INSERT INTO archive_entries (id, "userId", "resultId", "createdAt") VALUES ($1,$2,$3,NOW()) ON CONFLICT ("userId", "resultId") DO NOTHING', randomUUID(), userId, resultId); else { const set = this.archives.get(userId) ?? new Set<string>(); set.add(resultId); this.archives.set(userId, set); } return { resultId, saved: true }; }); }
  async list(token: string) { const userId = this.verify(token); const ids = this.dbEnabled ? (await this.prisma.$queryRawUnsafe<Array<{ resultId: string; createdAt: Date }>>('SELECT "resultId" as "resultId", "createdAt" as "createdAt" FROM archive_entries WHERE "userId" = $1 ORDER BY "createdAt" DESC', userId)).map((r) => ({ resultId: r.resultId, createdAt: r.createdAt })) : [...(this.archives.get(userId) ?? [])].map((resultId) => ({ resultId, createdAt: new Date() })); const items = []; for (const entry of ids) { const result = await this.repository.getResult(entry.resultId); if (!result) continue; const era = eras.find((e) => e.id === result.core.eraId); const location = historicalLocations.find((l) => l.id === result.core.locationId); const occupation = occupations.find((o) => o.id === result.core.occupationId); items.push({ resultId: entry.resultId, recordNo: result.core.recordNo, headline: `${era?.label ?? ''} ${location?.label ?? ''} · ${occupation?.label ?? ''}`, createdAt: entry.createdAt.toISOString() }); } return { items }; }
  async detail(resultId: string, token: string) {
    const userId = this.verify(token);
    const owned = this.dbEnabled
      ? (await this.prisma.archiveEntry.count({ where: { userId, resultId } })) > 0
      : this.archives.get(userId)?.has(resultId) === true;
    if (!owned) throw new ForbiddenException({ code: 'ARCHIVE_ACCESS_DENIED', message: 'This result is not in the user archive' });
    const result = await this.repository.getResult(resultId);
    if (!result) throw new BadRequestException({ code: 'RESULT_NOT_FOUND', message: 'Result not found' });
    const session = await this.repository.getSession(result.sessionId);
    return { ...(await this.results.basic(resultId)), viewMode: session?.viewMode ?? 'TEXT' };
  }
  async deleteArchive(resultId: string, token: string) {
    const userId = this.verify(token);
    if (this.dbEnabled) {
      await this.prisma.archiveEntry.deleteMany({ where: { userId, resultId } });
    } else {
      this.archives.get(userId)?.delete(resultId);
    }
  }
  private get dbEnabled() { return Boolean(process.env.DATABASE_URL && process.env.USE_IN_MEMORY_DB !== 'true'); }
  private sign(userId: string) {
    const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64url');
    const secret = resolveAuthRuntimeConfig().jwtSecret;
    const sig = createHmac('sha256', secret).update(payload).digest('base64url');
    return `${payload}.${sig}`;
  }

  private verify(token: string) {
    const [payload, sig, extra] = token.split('.');
    const unauthorized = () => new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Valid bearer token required' });
    if (!payload || !sig || extra) throw unauthorized();

    const secret = resolveAuthRuntimeConfig().jwtSecret;
    const expected = Buffer.from(createHmac('sha256', secret).update(payload).digest('base64url'));
    const supplied = Buffer.from(sig);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) throw unauthorized();

    let parsed: { sub?: unknown; exp?: unknown };
    try {
      parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { sub?: unknown; exp?: unknown };
    } catch {
      throw unauthorized();
    }
    if (typeof parsed.sub !== 'string' || typeof parsed.exp !== 'number') throw unauthorized();
    if (parsed.exp < Date.now() / 1000) throw new UnauthorizedException({ code: 'TOKEN_EXPIRED', message: 'Token expired' });
    return parsed.sub;
  }
}
