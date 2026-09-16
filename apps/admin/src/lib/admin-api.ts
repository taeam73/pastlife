const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export type Summary = { contentVersion: string; questions: number; choices: number; tags: number; axes: number; eras: number; regions: number };
export type Question = { id: string; stage: number; text: string; choiceCount: number };
export type PublishHistory = { contentVersion: string; published: number; digest: string; publishedAt: string };
export type AuditEntry = { action: string; target?: string; at: string };

export function createAdminClient(token: string) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token, ...init.headers },
    });
    const body = (await response.json()) as T & { message?: string };
    if (!response.ok) throw new Error(body.message ?? '관리자 요청에 실패했습니다.');
    return body;
  }

  return {
    summary: () => request<Summary>('/admin/content/summary'),
    questions: () => request<{ items: Question[] }>('/admin/content/questions'),
    history: () => request<{ items: PublishHistory[] }>('/admin/content/publish-history'),
    audit: () => request<{ items: AuditEntry[] }>('/admin/content/audit-log'),
    saveDraft: (id: string, text: string) => request<{ saved: boolean }>(`/admin/content/questions/${id}/draft`, { method: 'PUT', body: JSON.stringify({ text }) }),
    publish: () => request<{ contentVersion: string; published: number; publishedAt: string }>('/admin/content/publish', { method: 'POST' }),
    rollback: (digest: string) => request<{ restored: number; found: boolean }>(`/admin/content/rollback?digest=${encodeURIComponent(digest)}`, { method: 'POST' }),
  };
}
