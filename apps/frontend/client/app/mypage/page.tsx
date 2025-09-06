"use client";

import { useEffect, useMemo, useState } from "react";
import PlaylistModal, { Track } from "../components/sections/playlistmodal";
import UsageLogModal from "../components/sections/UsageLogModal";
import SubscriptionModal, {
  Purchase as UIModalPurchase,
  MileageDelta as UIModalMileage,
} from "../components/sections/SubscriptionModal";
import ProfileEditModal, { ProfileEditValues } from "../components/sections/ProfileEditModal";
import UsingRow, { UsingTrackApi } from "../components/using/UsingRow";

// ★ JSON/PATCH + 파일(FormData) 모두 처리하는 함수
import { updateMeProfileFormData } from "@/lib/api/me";

import { useMeOverview } from "@/hooks/useMeOverview";
import useHistory from "@/hooks/useHestory";

/* ---------------- UI Utils ---------------- */
function maskKey(last4: string | null | undefined) {
  if (!last4) return "****-****-****-****";
  return `••••-••••-••••-${last4}`;
}
async function copyTextSafe(text: string) {
  if (!text) return false;
  try {
    const secure =
      typeof window !== "undefined" &&
      (window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1");
    if (secure && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
function genMockKey(len = 40) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let s = "sk_live_";
  for (let i = 0; i < bytes.length; i++) s += alphabet[bytes[i] % alphabet.length];
  return s;
}
function shortenAddr(addr?: string | null, head = 6, tail = 4) {
  if (!addr) return "-";
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
}

/** 상대 이미지 경로를 절대 URL로 변환 + 플레이스홀더 제공 (camelCase 기준) */
function resolveImageUrl(absOrRel?: string | null) {
  if (!absOrRel) return "https://picsum.photos/seed/profile_fixed/400/400";
  if (/^https?:\/\//i.test(absOrRel)) return absOrRel;
  const base = (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000").replace(/\/+$/, "");
  return `${base}${absOrRel.startsWith("/") ? "" : "/"}${absOrRel}`;
}

/* ---------------- Types ---------------- */
type TabKey = "using" | "playlist";
type Playlist = { id: number; name: string; cover: string; count: number };

/* ---------------- Page ---------------- */
export default function MyPage() {
  const [tab, setTab] = useState<TabKey>("using");

  // 모달들
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [subsOpen, setSubsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // ======== /me/overview ========
  const { data, loading, error, refresh, setData } = useMeOverview();

  // ⬇️ /me/history (구매/마일리지 이력)
  const { data: hist, loading: histLoading, error: histError } = useHistory();

  // UsingRow 매핑
  const usingData: UsingTrackApi[] = useMemo(() => {
    if (!Array.isArray(data?.usingList)) return [];
    return data.usingList.map((r: any) => ({
      id: r.id,
      title: r.title,
      artist: r.artist ?? "",
      category: "",
      cover: r.cover ?? "https://picsum.photos/seed/cover/600/600",
      leadersEarned: r.leadersEarned ?? 0,
      lastUsedAt: r.lastUsedAt ?? "",
      startedAt: "",
      monthReward: 0,
      monthlyRewards: [],
    }));
  }, [data]);

  /* ---------- API 키: 프리뷰/재발급 ---------- */
  const [apiKeyLast4, setApiKeyLast4] = useState<string | null>(null);
  const [fetchingKey, setFetchingKey] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [issuedKey, setIssuedKey] = useState("");
  const [keyVisible, setKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!data) return;
    setApiKeyLast4(data.apiKey?.last4 ?? null);
  }, [data]);

  useEffect(() => {
    setFetchingKey(!!loading);
  }, [loading]);

  // ---------------- 사용 기록 모달 상태/핸들러 ----------------
  const [usageOpen, setUsageOpen] = useState(false);
  const [usageTrackId, setUsageTrackId] = useState<string | number | null>(null);
  const [usageEndpoint, setUsageEndpoint] = useState<string | null>(null);
  const [usageTitle, setUsageTitle] = useState<string | undefined>(undefined);

  function openUsage(t: UsingTrackApi) {
    const USING_API = "/api/using-tracks";
    const endpoint = `${USING_API}/${t.id}/logs?days=7`;
    setUsageTrackId(t.id);
    setUsageEndpoint(endpoint);
    setUsageTitle(`${t.title} · 사용 기록`);
    setUsageOpen(true);
  }

  // ======= 프로필(Me) 뷰 모델 =======
  const meProfile = useMemo(() => {
    const c = data?.company;
    return {
      name: c?.name ?? "내 회사",
      grade: c?.grade ?? "free",
      profileImageUrl: c?.profileImageUrl ?? null,
      walletAddress: c?.smartAccountAddress ?? "0x0000...0000",
      rewardBalance: c?.rewardBalance ?? 0,
    };
  }, [data]);

  const gradeLabel = (g?: string | null) =>
    g === "business" ? "Business" : g === "standard" ? "Standard" : "Free";

  // ProfileEditModal 초기값
  const profileInitial: ProfileEditValues = useMemo(
    () => ({
      ceo_name: data?.company?.ceoName ?? "",
      phone: data?.company?.phone ?? "",
      homepage_url: data?.company?.homepageUrl ?? "",
      profile_image_url: data?.company?.profileImageUrl ?? "",
      avatarUrl: data?.company?.profileImageUrl ?? "",
    }),
    [data]
  );

  // ★ 모달에서 (values, file?) 넘겨주면 이 함수가 서버에 PATCH (FormData) 호출
  async function handleSaveProfile(v: ProfileEditValues, file?: File) {
    const prev = data;

    // 1) 낙관적 업데이트 (파일 있으면 즉시 로컬 미리보기 표시)
    setData?.((p: any) =>
      p
        ? {
            ...p,
            company: {
              ...(p.company ?? {}),
              profileImageUrl: file
                ? URL.createObjectURL(file)
                : v.profile_image_url || p.company?.profileImageUrl || "",
              ceoName: v.ceo_name ?? p.company?.ceoName ?? "",
              phone: v.phone ?? p.company?.phone ?? "",
              homepageUrl: v.homepage_url ?? p.company?.homepageUrl ?? "",
            },
          }
        : p
    );
    setProfileOpen(false);

    try {
      setSavingProfile(true);
      // 2) 서버 저장 (파일 있으면 multipart, 없으면 JSON)
      const saved = await updateMeProfileFormData(
        {
          ceo_name: v.ceo_name?.trim() || undefined,
          phone: v.phone?.trim() || undefined,
          homepage_url: v.homepage_url?.trim() || undefined,
          profile_image_url: v.profile_image_url || v.avatarUrl || undefined,
        },
        file
      );
      // 3) 서버에서 최신 overview 형태로 응답 시 그대로 반영
      setData?.(saved);
    } catch (e: any) {
      // 4) 실패 시 롤백
      setData?.(prev as any);
      alert(e?.message || "프로필 저장 실패");
    } finally {
      setSavingProfile(false);
    }
  }

  const playlists: Playlist[] = [
    { id: 1, name: "출근용 하이텐션", cover: "https://picsum.photos/seed/pl-1/800/600", count: 10 },
    { id: 2, name: "카페 감성 팝", cover: "https://picsum.photos/seed/pl-2/800/600", count: 8 },
    { id: 3, name: "야근용 Lo-Fi", cover: "https://picsum.photos/seed/pl-3/800/600", count: 12 },
  ];

  if (loading) return <main className="p-6">로딩중…</main>;
  if (error) return <main className="p-6 text-red-500">에러: {error}</main>;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
      {/* 상단 프로필 */}
      <section className="rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/60">
        <div className="flex min-h-[112px] items-start gap-5">
          <img
            src={resolveImageUrl(meProfile.profileImageUrl)}
            alt="프로필 이미지"
            className="h-24 w-24 rounded-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "https://picsum.photos/seed/profile_fixed/400/400";
            }}
          />
          <div className="flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-[22px] font-bold leading-none text-zinc-900 dark:text-white">
              {meProfile.name}
              <span className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold bg-zinc-900/95 text-white ring-1 ring-white/10 shadow-sm dark:bg-white dark:text-zinc-900 dark:ring-zinc-900/10">
                {gradeLabel(meProfile.grade)}
              </span>
              <button
                type="button"
                onClick={async () => {
                  const ok = await copyTextSafe(meProfile.walletAddress ?? "");
                  if (ok) console.log("지갑주소 복사됨");
                }}
                className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-3 py-1 text-[12px] font-medium text-violet-600 ring-1 ring-violet-500/20 hover:bg-violet-500/20 dark:text-violet-300 dark:ring-violet-400/30"
                title="지갑주소 복사"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-80">
                  <path d="M2 7a2 2 0 0 1 2-2h10l4 4v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M14 5v4h4" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>{shortenAddr(meProfile.walletAddress)}</span>
              </button>
            </h1>

            {/* 배지 */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
                보유 리워드 {meProfile.rewardBalance.toLocaleString()}점
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-500/15 px-3 py-1 text-[12px] font-medium text-amber-600 dark:text-amber-400">
                사용 중인 총 음원 : {data?.usingSummary?.usingCount ?? 0}개
              </span>
              <button
                type="button"
                onClick={() => setSubsOpen(true)}
                className="inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-[12px] font-medium text-blue-600 dark:text-blue-400"
              >
                구독 남은 기간 {data?.subscription?.remainingDays ?? 0}일
              </button>
            </div>

            {/* API 키 프리뷰 + 재발급/복사 */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white/80 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
                <span className="text-[12px] text-zinc-500 dark:text-zinc-400">API Key</span>
                <code className="font-mono text-zinc-800 dark:text-zinc-200">
                  {fetchingKey ? "로딩중…" : maskKey(apiKeyLast4)}
                </code>
                <button
                  type="button"
                  aria-label="마스킹된 API 키 복사"
                  onClick={async () => {
                    await copyTextSafe(fetchingKey ? "" : maskKey(apiKeyLast4));
                  }}
                  className="ml-2 inline-flex items-center rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs 
                            hover:bg-zinc-50 active:scale-[.99] dark:border-white/10 dark:bg-white/5"
                  title="복사"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span className="ml-1">복사</span>
                </button>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (rotating) return;
                  setRotating(true);
                  try {
                    // === 백엔드 재발급 호출 ===
                    const base = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/+$/, "");
                    const companyId = (data as any)?.company?.id ?? (data as any)?.id;
                    if (!companyId) throw new Error("회사 ID를 찾을 수 없습니다.");

                    const url = `${base}/companies/${companyId}/regenerate-api-key`;
                    const res = await fetch(url, { method: "POST", credentials: "include" });
                    const j = await res.json().catch(() => ({} as any));
                    if (!res.ok) throw new Error(j?.message || `HTTP ${res.status}`);
                    const key: string = j?.api_key ?? j?.apiKey ?? "";
                    if (!key) throw new Error("서버가 새 API 키를 반환하지 않았습니다.");

                    // 모달 1회 노출 + last4 UI 반영
                    const last4 = key.slice(-4);
                    setIssuedKey(key);
                    setKeyVisible(false);
                    setCopied(false);
                    setKeyModalOpen(true);
                    setApiKeyLast4(last4);
                    setData?.((prev: any) => (prev ? { ...prev, apiKey: { ...(prev.apiKey ?? {}), last4 } } : prev));
                  } catch (e) {
                    console.error(e);
                    // 안전망(모의키) — 실제 운영에선 제거 권장
                    const key = genMockKey();
                    const last4 = key.slice(-4);
                    setIssuedKey(key);
                    setKeyVisible(false);
                    setCopied(false);
                    setKeyModalOpen(true);
                    setApiKeyLast4(last4);
                    setData?.((prev: any) => (prev ? { ...prev, apiKey: { ...(prev.apiKey ?? {}), last4 } } : prev));
                  } finally {
                    setRotating(false);
                  }
                }}
                disabled={rotating}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60
                          dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                {rotating ? "재발급 중…" : "API 키 재발급"}
              </button>
              <button onClick={refresh} className="rounded-lg border px-3 py-2 text-sm">새로고침</button>
            </div>
          </div>

          <div className="ml-auto mt-4 sm:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => setProfileOpen(true)}
              disabled={savingProfile}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50
                        disabled:opacity-60 dark:border-white/10 dark:bg:white/5 dark:text-zinc-100 dark:hover:bg-white/10"
            >
              {savingProfile ? "저장 중…" : "프로필 편집"}
            </button>
          </div>
        </div>
      </section>

      {/* 탭 헤더 */}
      <div className="mt-8 border-b border-zinc-200 dark:border-white/10">
        <div className="flex gap-6">
          <button
            onClick={() => setTab("using")}
            className={`relative -mb-px pb-3 text-sm font-medium leading-none transition-colors ${
              tab === "using" ? "text-zinc-900 dark:text-white" : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
            aria-current={tab === "using" ? "page" : undefined}
          >
            사용중인 음원
            <span
              className={`pointer-events-none absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full transition-opacity ${
                tab === "using" ? "opacity-100 bg-red-500" : "opacity-0"
              }`}
            />
          </button>
          <button
            onClick={() => setTab("playlist")}
            className={`relative -mb-px pb-3 text-sm font-medium leading-none transition-colors ${
              tab === "playlist" ? "text-zinc-900 dark:text-white" : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
            aria-current={tab === "playlist" ? "page" : undefined}
          >
            플레이리스트
            <span
              className={`pointer-events-none absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full transition-opacity ${
                tab === "playlist" ? "opacity-100 bg-red-500" : "opacity-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="mt-6">
        {tab === "using" ? (
          <section className="space-y-3">
            <div className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white/70 dark:divide-white/10 dark:border-white/10 dark:bg-zinc-900/60">
              {usingData.map((t) => (
                <UsingRow key={t.id} t={t} USING_API={"/api/using-tracks"} openUsage={(tt) => openUsage(tt)} />
              ))}
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {playlists.map((p) => (
              <div
                key={p.id}
                className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
              >
                <div className="group relative h-48 w-full overflow-hidden bg-zinc-100 md:h-56 lg:h-60 dark:bg-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      const SAMPLE_MP3 = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
                      const tracks: Track[] = Array.from({ length: p.count }).map((_, i) => ({
                        id: i + 1,
                        title: `${p.name} - Track ${i + 1}`,
                        artist: "Various",
                        coverUrl: `https://picsum.photos/seed/${p.id}-${i}/600/600`,
                        audioUrl: SAMPLE_MP3,
                      }));
                      setPlaylistTracks(tracks);
                      setPlaylistIndex(0);
                      setPlaylistOpen(true);
                    }}
                    className="h-full w-full"
                    aria-label={`${p.name} 상세 보기`}
                  >
                    <img
                      src={p.cover}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </button>
                </div>
                <div className="p-3">
                  <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{p.name}</div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{p.count}곡</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 모달들 */}
      <PlaylistModal
        isOpen={playlistOpen}
        onClose={() => setPlaylistOpen(false)}
        tracks={playlistTracks}
        initialIndex={playlistIndex}
      />

      {/* ★ uploadEndpoint prop 제거! (모달은 업로드 안 함) */}
      <ProfileEditModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        initial={profileInitial}
        onSave={handleSaveProfile}
      />

      <SubscriptionModal
        open={subsOpen}
        onClose={() => setSubsOpen(false)}
        planName={data?.subscription?.plan === "business" ? "Business" : data?.subscription?.plan === "standard" ? "Standard" : "Free"}
        nextBillingAt={""}
        autoRenew={data?.subscription?.status === "active"}
        purchases={hist?.purchases ? (hist.purchases as unknown as UIModalPurchase[]) : []}
        minusList={hist?.mileageLogs ? (hist.mileageLogs as unknown as UIModalMileage[]) : []}
        onCancel={() => {
          alert("구독 취소가 예약되었습니다. 현재 구독 종료 시점부터 free 등급으로 전환됩니다.");
          setSubsOpen(false);
        }}
        onResume={() => {
          alert("자동갱신을 재개했습니다.");
          setSubsOpen(false);
        }}
      />

      <UsageLogModal
        isOpen={usageOpen}
        onClose={() => setUsageOpen(false)}
        trackId={usageTrackId}
        endpoint={usageEndpoint}
        title={usageTitle}
      />

      {/* 안내 문구 */}
      <p className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">리워드 초기화는 매월 1일입니다.</p>

      {/* === API 키 재발급 모달 === */}
      {keyModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <section
            role="dialog"
            aria-modal="true"
            className="relative z-[1001] w-[min(560px,92vw)] rounded-2xl bg-white text-zinc-900 shadow-xl
                      dark:bg-zinc-900 dark:text:white border border-zinc-200 dark:border-white/10 p-5"
          >
            <h2 className="text-lg font-semibold">새 API 키가 발급되었습니다</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              아래 키는 보안상 <b>지금 한 번만</b> 표시됩니다. 안전한 곳에 보관하세요.
            </p>

            <div className="mt-4 rounded-lg border border-zinc-200 dark:border:white/10 bg-zinc-50 dark:bg:white/5 p-3">
              <div className="mb-1 text-[11px] text-zinc-500 dark:text-zinc-400">API Key</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all text-sm">{keyVisible ? issuedKey : "•".repeat(Math.max(issuedKey.length, 8))}</code>
                <button
                  onClick={() => setKeyVisible((v) => !v)}
                  className="h-8 rounded-md border border-zinc-200 dark:border-white/10 px-2 text-xs hover:bg-zinc-100 dark:hover:bg-white/10"
                >
                  {keyVisible ? "숨기기" : "보기"}
                </button>
                <button
                  onClick={async () => {
                    const ok = await copyTextSafe(issuedKey);
                    setCopied(ok);
                    setTimeout(() => setCopied(false), 1200);
                  }}
                  className="h-8 rounded-md bg-zinc-900 text-white px-3 text-xs hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  {copied ? "복사됨" : "복사"}
                </button>
              </div>
            </div>

            <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              • 키를 분실하면 다시 재발급해야 합니다. <br />• 다른 사람과 공유하지 마세요.
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setKeyModalOpen(false)}
                className="h-10 rounded-md bg-zinc-900 text-white px-4 text-sm font-medium hover:bg-zinc-800 dark:bg:white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                확인
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
