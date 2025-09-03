"use client";

import { useEffect, useState } from "react";

export type UsageLog = {
  id: string | number;
  at: string;             // 호출 내역 시각
  kind: "play" | "download" | "api"; // 호출 내역 유형
  delta: number;          // 차감/적립량 (+/-)
  remaining: number;      // 호출 내역 직후 남은 리워드 스냅샷
  meta?: string;          // 기타(엔드포인트, IP 등)
};

export default function UsageLogModal({
  isOpen,
  onClose,
  trackId,
  endpoint,     // 예: `/api/using-tracks/${trackId}/logs?days=7&cursor=...`
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  trackId: string | number | null;
  endpoint: string | null;
  title?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 더미용 스위치 (서버 없으면 true)
  const MOCK = false;

  async function fetchLogs(cursor?: string) {
    if (!endpoint) return;
    setLoading(true);
    setError(null);
    try {
      if (MOCK) {
        const dummy: UsageLog[] = Array.from({ length: 12 }).map((_, i) => ({
          id: i + 1 + (logs.length || 0),
          at: new Date(Date.now() - i * 3600_000).toLocaleString("ko-KR"),
          kind: i % 3 === 0 ? "play" : i % 3 === 1 ? "download" : "api",
          delta: i % 2 === 0 ? 0 : -1,
          remaining: 150 - i,
          meta: i % 3 === 2 ? "/v1/musics/play" : undefined,
        }));
        setLogs((prev) => (cursor ? [...prev, ...dummy] : dummy));
        setNextCursor(null);
        return;
      }
      const url = cursor ? `${endpoint}${endpoint.includes("?") ? "&" : "?"}cursor=${encodeURIComponent(cursor)}` : endpoint;
      const res = await fetch(url, { cache: "no-store" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.message || `HTTP ${res.status}`);
      setLogs((prev) => (cursor ? [...prev, ...(j?.data ?? j?.logs ?? [])] : (j?.data ?? j?.logs ?? [])));
      setNextCursor(j?.nextCursor ?? null);
    } catch (e: any) {
      setError(e?.message || "로그를 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isOpen || !trackId || !endpoint) return;
    setLogs([]);
    setNextCursor(null);
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, trackId, endpoint]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        className="relative z-[1001] w-[min(720px,94vw)] rounded-2xl bg-white text-zinc-900 shadow-xl
                   dark:bg-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 p-5"
      >
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title ?? "사용 호출 내역"}</h2>
          <button
            onClick={onClose}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50
                       dark:border-white/10 dark:hover:bg-white/10"
          >
            닫기
          </button>
        </header>

        <div className="mt-3">
          {error && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="max-h-[56vh] overflow-auto rounded-lg border border-zinc-200 dark:border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
                <tr>
                  <th className="px-3 py-2 text-left"></th>
                  <th className="px-3 py-2 text-left">리워드 발생</th>
                  <th className="px-3 py-2 text-right"></th>
                  <th className="px-3 py-2 text-right">시간</th>
                  <th className="px-3 py-2 text-left">메타</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
                {logs.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2">{row.at}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-md border px-2 py-0.5 text-xs dark:border-white/10">
                        {row.kind}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {row.delta >= 0 ? `+${row.delta}` : row.delta}
                    </td>
                    <td className="px-3 py-2 text-right">{row.remaining.toLocaleString()}</td>
                    <td className="px-3 py-2">{row.meta ?? "-"}</td>
                  </tr>
                ))}
                {!loading && logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-zinc-500 dark:text-zinc-400">
                      표시할 기록이 없어요.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              총 {logs.length}건
            </span>
            <button
              disabled={loading || !nextCursor}
              onClick={() => fetchLogs(nextCursor!)}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50
                         dark:bg-white dark:text-zinc-900"
            >
              {loading ? "불러오는 중…" : nextCursor ? "더 보기" : "더 이상 없음"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
