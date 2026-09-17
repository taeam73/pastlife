import { Inject, Injectable } from '@nestjs/common';
import { questions } from '@pastlife/content';
import { PrismaService } from '../prisma/prisma.service.js';
import { createHash, randomUUID } from 'node:crypto';
type Draft = { id: string; text?: string | undefined; choices?: Record<string, string> | undefined };
type Audit = { action: string; target?: string; at: string };
@Injectable()
export class AdminService {
  private readonly drafts = new Map<string, Draft>();
  private readonly history: Array<{ contentVersion: string; published: number; digest: string; publishedAt: string; snapshot: Draft[] }> = [];
  private readonly audit: Audit[] = [];
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  async saveDraft(input: Draft) { this.drafts.set(input.id, input); await this.recordAudit('DRAFT_SAVED', input.id); if (this.dbEnabled && input.text) await this.prisma.$executeRawUnsafe('INSERT INTO translations (id, locale, key, text, status, version) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (locale,key,version) DO UPDATE SET text = EXCLUDED.text, status = EXCLUDED.status', randomUUID(), 'ko', `question.${input.id}`, input.text, 'DRAFT', process.env.CONTENT_VERSION ?? '2.5.0'); return { saved: true, draft: input }; }
  listDrafts() { return { items: [...this.drafts.values()] }; }
  async publish() { const version = process.env.CONTENT_VERSION ?? '2.5.0'; const snapshot = [...this.drafts.values()]; const published = snapshot.length; const publishedAt = new Date().toISOString(); const digest = createHash('sha256').update(JSON.stringify(snapshot)).digest('hex'); if (this.dbEnabled && published) { await this.prisma.$executeRawUnsafe('INSERT INTO content_versions (id, version, status, digest, "publishedAt", "createdAt") VALUES ($1,$2,$3,$4,$5,NOW()) ON CONFLICT (version) DO UPDATE SET status = EXCLUDED.status, digest = EXCLUDED.digest, "publishedAt" = EXCLUDED."publishedAt"', randomUUID(), version, 'PUBLISHED', digest, publishedAt); await this.prisma.$executeRawUnsafe('UPDATE translations SET status = $1 WHERE version = $2', 'PUBLISHED', version); } this.history.unshift({ contentVersion: version, published, digest, publishedAt, snapshot }); await this.recordAudit('PUBLISHED', version); this.drafts.clear(); return { contentVersion: version, published, publishedAt }; }
  publishHistory() { return { items: this.history.slice(0, 20).map(({ snapshot, ...item }) => item) }; }
  rollback(digest: string) { const entry = this.history.find((item) => item.digest === digest); if (!entry) return { restored: 0, found: false }; this.drafts.clear(); for (const draft of entry.snapshot) this.drafts.set(draft.id, draft); void this.recordAudit('ROLLBACK_PREPARED', digest); return { restored: entry.snapshot.length, found: true, digest }; }
  async auditLog() { if (this.dbEnabled) { const items = await this.prisma.$queryRawUnsafe<Audit[]>('SELECT action, target, "createdAt" as at FROM audit_logs ORDER BY "createdAt" DESC LIMIT 50'); return { items }; } return { items: this.audit.slice(0, 50) }; }
  private async recordAudit(action: string, target: string) { const entry = { action, target, at: new Date().toISOString() }; this.audit.unshift(entry); if (this.dbEnabled) await this.prisma.$executeRawUnsafe('INSERT INTO audit_logs (id, action, target, "createdAt") VALUES ($1,$2,$3,NOW())', randomUUID(), action, target); }
  hasQuestion(id: string) { return questions.some((q) => q.id === id); }
  private get dbEnabled() { return Boolean(process.env.DATABASE_URL && process.env.USE_IN_MEMORY_DB !== 'true'); }
}
