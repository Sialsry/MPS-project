// src/lib/api/core/http.ts
const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';
if (!RAW_BASE) throw new Error('NEXT_PUBLIC_API_BASE 가 비어 있습니다 (.env.local 설정 필요).');
const BASE = RAW_BASE.replace(/\/+$/, '');

function join(path: string) {
  return /^https?:\/\//i.test(path) ? path : `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseJsonOrText(res: Response) {
  if (res.status === 204 || res.status === 205) return null;

  
  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) throw new Error(typeof body === 'string' ? body : JSON.stringify(body));
  if (!isJson) throw new Error(`Non-JSON response: ${String(body).slice(0, 200)}`);
  return body;
}

/** JSON/일반 요청용: body가 있으면 적절히 Content-Type 설정 */
export async function api(path: string, init: RequestInit = {}) {
  const headers: Record<string, string> = { Accept: 'application/json', ...(init.headers as any) };

  // body가 있을 때만 Content-Type 설정 (FormData/URLSearchParams는 브라우저가 넣음)
  const hasBody = init.body !== undefined && init.body !== null;
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  const isUrlParams = typeof URLSearchParams !== 'undefined' && init.body instanceof URLSearchParams;

  if (hasBody && !isFormData && !isUrlParams && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json; charset=utf-8';
  }

  const res = await fetch(join(path), {
    credentials: 'include',
    cache: 'no-store',
    ...init,
    headers,
  });
  return parseJsonOrText(res);
}

/** multipart/form-data 요청용 (Content-Type 지정 금지) */
export async function apiForm(path: string, form: FormData, init: RequestInit = {}) {
  const res = await fetch(join(path), { method: 'POST', body: form, cache: 'no-store', ...init });
  return parseJsonOrText(res);
}

export function qs(params: Record<string, any>) {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) s.set(k, String(v)); });
  return s.toString();
}
