import { HttpException, HttpStatus } from '@nestjs/common';
const buckets = new Map<string, number[]>();
export function rateLimitMiddleware(request: { path: string; ip?: string }, _response: unknown, next: () => void) {
  const protectedRoute = request.path.startsWith('/api/v1/auth') || request.path.startsWith('/api/v1/admin');
  if (!protectedRoute) return next();
  const key = `${request.ip ?? 'unknown'}:${request.path.split('/').slice(0, 5).join('/')}`;
  const now = Date.now(); const recent = (buckets.get(key) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 60) throw new HttpException({ code: 'RATE_LIMITED', message: 'Too many requests' }, HttpStatus.TOO_MANY_REQUESTS);
  recent.push(now); buckets.set(key, recent); next();
}
