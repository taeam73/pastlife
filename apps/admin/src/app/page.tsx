'use client';

import { useEffect, useState } from 'react';
import { createAdminClient, type AuditEntry, type PublishHistory, type Question, type Summary } from '../lib/admin-api';

const TOKEN_KEY = 'pastlife.admin.token';
const cellStyle = { borderTop: '1px solid #eee', padding: 8 };

export default function AdminHome() {
  const [tokenInput, setTokenInput] = useState('');
  const [token, setToken] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [history, setHistory] = useState<PublishHistory[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load(activeToken: string) {
    const client = createAdminClient(activeToken);
    const [nextSummary, nextQuestions, nextHistory, nextAudit] = await Promise.all([
      client.summary(), client.questions(), client.history(), client.audit(),
    ]);
    setSummary(nextSummary);
    setQuestions(nextQuestions.items);
    setHistory(nextHistory.items);
    setAudit(nextAudit.items);
  }

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (!stored) return;
    setToken(stored);
    setTokenInput(stored);
    void load(stored).catch(() => {
      sessionStorage.removeItem(TOKEN_KEY);
      setToken('');
      setError('저장된 관리자 토큰이 유효하지 않습니다.');
    });
  }, []);

  async function login() {
    setError('');
    try {
      await load(tokenInput);
      sessionStorage.setItem(TOKEN_KEY, tokenInput);
      setToken(tokenInput);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '로그인에 실패했습니다.');
    }
  }

  async function refresh() {
    setError('');
    try { await load(token); }
    catch (cause) { setError(cause instanceof Error ? cause.message : '새로고침에 실패했습니다.'); }
  }

  async function saveDraft(question: Question) {
    const text = drafts[question.id];
    if (!text?.trim()) return;
    await createAdminClient(token).saveDraft(question.id, text);
    setMessage(`${question.id} 초안 저장 완료`);
    await refresh();
  }

  async function publish() {
    const result = await createAdminClient(token).publish();
    setMessage(`게시 완료: ${result.published}건 / ${result.contentVersion}`);
    await refresh();
  }

  async function rollback(digest: string) {
    const result = await createAdminClient(token).rollback(digest);
    setMessage(`롤백 준비 완료: ${result.restored}건`);
    await refresh();
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(''); setTokenInput(''); setSummary(null);
  }

  return <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32, fontFamily: 'sans-serif' }}>
    <h1>전생록 콘텐츠 관리자</h1><p>콘텐츠 검수 및 게시 콘솔</p>
    {!token ? <section aria-label="관리자 로그인" style={{ maxWidth: 420 }}>
      <label htmlFor="admin-token">관리자 토큰</label>
      <input id="admin-token" type="password" value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} style={{ display: 'block', width: '100%', padding: 10, margin: '8px 0 12px' }} />
      <button onClick={() => void login()} disabled={!tokenInput.trim()}>관리자 로그인</button>
    </section> : <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => void publish()}>초안 게시</button>
        <button onClick={() => void refresh()}>새로고침</button>
        <button onClick={logout}>로그아웃</button>
      </div>
      {summary ? <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <SummaryCard label="버전" value={summary.contentVersion} /><SummaryCard label="질문" value={summary.questions} />
        <SummaryCard label="선택지" value={summary.choices} /><SummaryCard label="태그/축" value={`${summary.tags}/${summary.axes}`} />
      </section> : null}
      <h2>질문 목록</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th align="left">ID</th><th align="left">단계</th><th align="left">문구</th><th>초안</th></tr></thead><tbody>
        {questions.map((question) => <tr key={question.id}><td style={cellStyle}>{question.id}</td><td style={cellStyle}>{question.stage}</td><td style={cellStyle}>{question.text}</td><td style={cellStyle}>
          <input aria-label={`${question.id} 초안`} value={drafts[question.id] ?? ''} onChange={(event) => setDrafts((current) => ({ ...current, [question.id]: event.target.value }))} />
          <button aria-label={`${question.id} 초안 저장`} onClick={() => void saveDraft(question)}>저장</button>
        </td></tr>)}
      </tbody></table>
      <h2>게시 이력</h2>
      <table style={{ width: '100%' }}><thead><tr><th>버전</th><th>게시 수</th><th>시각</th><th>작업</th></tr></thead><tbody>
        {history.map((item) => <tr key={item.digest}><td>{item.contentVersion}</td><td>{item.published}</td><td>{item.publishedAt}</td><td><button aria-label="게시본 롤백 준비" onClick={() => void rollback(item.digest)}>롤백 준비</button></td></tr>)}
      </tbody></table>
      <h2>감사 로그</h2><ul>{audit.map((item, index) => <li key={`${item.action}-${item.at}-${index}`}>{item.action} {item.target ?? ''}</li>)}</ul>
    </>}
    {message ? <p role="status">{message}</p> : null}
    {error ? <p role="alert" style={{ color: '#b42318' }}>{error}</p> : null}
  </main>;
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}><strong>{label} {value}</strong></div>;
}
