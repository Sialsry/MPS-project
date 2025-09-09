// lib/http.ts

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';
if (!RAW_BASE) throw new Error('NEXT_PUBLIC_API_BASE 가 비어 있습니다 (.env.local 설정 필요).');
const BASE = RAW_BASE.replace(/\/+$/, '');

function join(path: string) {
  return /^https?:\/\//i.test(path) ? path : `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

function isAuthFreePath(pathname: string) {
  return (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/reset') ||
    pathname.startsWith('/public')
  );
}

function goLogin(reason = 'unauthorized') {
  try {
    if (typeof window === 'undefined') return;

    const { pathname, search } = window.location;

    if (isAuthFreePath(pathname)) return;

    const key = 'auth-redirect-ts';
    const now = Date.now();
    const last = Number(sessionStorage.getItem(key) || '0');
    if (now - last < 1500) return;
    sessionStorage.setItem(key, String(now));

    if (!sessionStorage.getItem('returnTo')) {
      sessionStorage.setItem('returnTo', pathname + search);
    }

    window.location.href = `/login?reason=${encodeURIComponent(reason)}`;
  } catch {}
}

async function readBody(res: Response) {
  if (res.status === 204 || res.status === 205) return null;

  const ct = res.headers.get('content-type') || '';
  const looksJson = ct.includes('application/json');

  try {
    return looksJson ? await res.json() : await res.text();
  } catch {
    try {
      return await res.text();
    } catch {
      return null;
    }
  }
}

async function parseJsonOrText(res: Response) {
  const body = await readBody(res);

  if (!res.ok) {
    const msg = typeof body === 'string' ? body.slice(0, 500) : JSON.stringify(body);
    const err = Object.assign(new Error(msg || `HTTP ${res.status}`), { response: res, body });
    throw err;
  }

  if (typeof body === 'string') {
    throw new Error(`Non-JSON response: ${body.slice(0, 200)}`);
  }
  return body;
}

export async function api(
  path: string,
  init: (RequestInit & { skipAuthRedirect?: boolean }) = {}
) {
  const headers: Record<string, string> = { Accept: 'application/json', ...(init.headers as any) };

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

  if (res.status === 401) {
    let reason = 'unauthorized';
    try {
      const cloned = res.clone();
      const maybeJson = await cloned.json().catch(() => null);
      if (maybeJson?.code) reason = String(maybeJson.code);
    } catch { /* noop */ }

    if (!init.skipAuthRedirect) {
      goLogin(reason);
    }
    const body = await readBody(res);
    const msg = typeof body === 'string' ? body.slice(0, 500) : JSON.stringify(body);
    const err = Object.assign(new Error(msg || 'Unauthorized'), { response: res, body, code: reason });
    throw err;
  }

  return parseJsonOrText(res);
}

/** multipart/form-data (Content-Type 지정 금지) */
export async function apiForm(path: string, form: FormData, init: RequestInit = {}) {
  const res = await fetch(join(path), {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    body: form,
    ...init,
  });
  return parseJsonOrText(res);
}

export function qs(params: Record<string, any>) {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) s.set(k, String(v)); });
  return s.toString();
}
