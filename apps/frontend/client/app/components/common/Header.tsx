// app/components/Header.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { RxHamburgerMenu } from "react-icons/rx";
import { ThemeSwitch } from "../ThemeSwitch";
import { useAuthStore } from "@/lib/store/auth";
import { assetUrl } from "@/lib/asset";

function NavItem({
  href,
  label,
  active,
}: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors
        ${active
          ? "text-zinc-900 dark:text-white"
          : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
        }`}
    >
      {label}
      <span
        className={`pointer-events-none absolute inset-x-2 -bottom-1 h-[1.5px] rounded-full transition-opacity
        ${active ? "opacity-100 bg-zinc-900 dark:bg-white" : "opacity-0"}`}
      />
    </Link>
  );
}

type Plan = { name: string; price: number };

function getInitial(s?: string) {
  const t = (s ?? "").trim();
  return t ? t[0]!.toUpperCase() : "?";
}
function Avatar({ src, fallback }: { src?: string | null; fallback: string }) {
  return src ? (
    <img
      src={src}
      alt="profile"
      className="h-8 w-8 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10"
      referrerPolicy="no-referrer"
    />
  ) : (
    <div
      className="h-8 w-8 rounded-full grid place-items-center text-xs font-semibold
                 bg-gradient-to-br from-zinc-200 to-zinc-300 text-zinc-700
                 dark:from-zinc-700 dark:to-zinc-800 dark:text-white"
    >
      {fallback}
    </div>
  );
}

export default function Header() {
  // ==== 인증(Zustand) ====
  const { profile, loading: authLoading, fetchMe, logout } = useAuthStore();
  const isLoggedIn = !!profile;
  const companyLabel = profile?.name || profile?.email || "사용자";

  // ==== UI ====
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [useLeaders, setUseLeaders] = useState<number>(0);
  const balance = 100000; // TODO: 실제 리워드 잔액으로 대체

  const router = useRouter();
  const pathname = usePathname();

  // mount/토큰변경 시 me 동기화
  useEffect(() => {
    let alive = true;
    fetchMe();
    const refetch = () => alive && fetchMe();
    window.addEventListener("mps:auth:changed", refetch);
    return () => { alive = false; window.removeEventListener("mps:auth:changed", refetch); };
  }, [fetchMe]);

  // 로그아웃
  const onLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // 요금제 모달
  const openConfirm = (plan: Plan) => {
    setPendingPlan(plan);
    setUseLeaders(0);
    setConfirmOpen(true);
  };

  // 결제(마일리지 확인) 계산
  const { maxUsable, clampedUse, remainingAfterUse, remainingToPay } = useMemo(() => {
    if (!pendingPlan) return { maxUsable: 0, clampedUse: 0, remainingAfterUse: balance, remainingToPay: 0 };
    const policyCap = Math.floor(pendingPlan.price * 0.3);
    const max = Math.min(policyCap, balance);
    const use = Math.max(0, Math.min(useLeaders || 0, max));
    const left = balance - use;
    const toPay = Math.max(pendingPlan.price - use, 0);
    return { maxUsable: max, clampedUse: use, remainingAfterUse: left, remainingToPay: toPay };
  }, [pendingPlan, balance, useLeaders]);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full border-b-0
                   bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white
                   border-zinc-200 border-opacity-60
                   dark:bg-zinc-900/60
                   shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.06)]
                   dark:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.06)]"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          {/* 좌측: 로고 + 내비 */}
          <div className="flex items-center gap-10">
            <Link href="/" className="text-xl font-bold tracking-widest text-zinc-900 dark:text-white">MPS</Link>

            {/* 데스크탑 내비게이션 */}
            <nav className="hidden md:flex items-center">
              <div className="flex items-center gap-1">
                <NavItem href="/musicList" label="음악" active={pathname.startsWith("/musicList")} />
                <NavItem href="/dosc" label="개발자 도구" active={pathname.startsWith("/dosc")} />
                {/* <NavItem href="/mypage" label="마이페이지" active={pathname.startsWith("/mypage")} /> */}
              </div>
            </nav>
          </div>

          {/* 우측: 테마 스위치 / 요금제 / 인증 */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <ThemeSwitch />
            </div>

            {/*  “요금제 보기”는 항상 표시 */}
            <button
              onClick={() => setShowPricing(true)}
              className="hidden md:inline-block rounded-full bg-teal-400 px-4 py-2 text-sm font-semibold text-black hover:bg-teal-300"
            >
              요금제 보기
            </button>

            {/* 로그인 X: 로그인/회원가입 */}
            {!authLoading && !isLoggedIn && (
              <div className="hidden md:flex gap-2">
                <Link
                  href="/login#top"
                  className="rounded-full px-3 py-1.5 text-sm font-medium
                             text-zinc-700 hover:bg-zinc-900/5
                             dark:text-white dark:hover:bg-white/10 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/register#top"
                  className="rounded-full px-3 py-1.5 text-sm font-medium
                             text-zinc-700 hover:bg-zinc-900/5
                             dark:text-white dark:hover:bg-white/10 transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}

            {/* 로그인 O: 사용자 드롭다운 */}
            {isLoggedIn && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm
                             text-zinc-700 hover:bg-zinc-900/5
                             dark:text-white dark:hover:bg-white/10 transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                >
                  <Avatar src={assetUrl(profile?.profile_image_url)} fallback={getInitial(companyLabel)} />
                  <span className="max-w-[180px] truncate">{companyLabel}</span>
                </button>

                {profileOpen && (
                  <div
                    onMouseLeave={() => setProfileOpen(false)}
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border shadow-lg
                               border-zinc-200/60 bg-white
                               dark:border-white/10 dark:bg-zinc-900"
                  >
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200/50 dark:border-white/10">
                      <Avatar src={assetUrl(profile?.profile_image_url)} fallback={getInitial(companyLabel)} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{companyLabel}</div>
                        {profile?.email && (
                          <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{profile.email}</div>
                        )}
                      </div>
                    </div>

                    {/* 마이페이지 링크 유지 */}
                    <Link
                      href="/mypage"
                      className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-900/5 dark:text-gray-200 dark:hover:bg-white/10"
                      onClick={() => setProfileOpen(false)}
                    >
                      마이페이지
                    </Link>

                    <button
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-900/5 dark:text-gray-200 dark:hover:bg-white/10"
                      onClick={onLogout}
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 모바일 햄버거 */}
            <button
              className="rounded-md p-2 text-zinc-700 hover:bg-zinc-900/5 dark:text-white dark:hover:bg-white/10 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="open menu"
              aria-expanded={menuOpen}
            >
              <RxHamburgerMenu className="text-2xl" />
            </button>
          </div>
        </div>

        {/* 모바일 서랍 */}
        {menuOpen && (
          <div className="border-t md:hidden border-zinc-200/60 bg-white/90 dark:border-white/10 dark:bg-zinc-900/90 backdrop-blur">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {/* 로그인 시 상단 요약 */}
              {isLoggedIn && (
                <div className="flex items-center gap-3 rounded-md px-3 py-2">
                  <Avatar src={assetUrl(profile?.profile_image_url)} fallback={getInitial(companyLabel)} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{companyLabel}</div>
                    {profile?.email && (
                      <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{profile.email}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-md px-3 py-2">
                <span className="text-sm text-zinc-700 dark:text-white/80">다크 모드</span>
                <ThemeSwitch />
              </div>

              <Link
                href="/musicList"
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-900/5 dark:text-gray-200 dark:hover:bg-white/10"
              >
                음악
              </Link>

              <Link
                href="/dosc"
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-900/5 dark:text-gray-200 dark:hover:bg-white/10"
              >
                개발자 도구
              </Link>

              {/*  모바일에도 마이페이지 유지 */}
              <Link
                href="/mypage"
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-900/5 dark:text-gray-200 dark:hover:bg-white/10"
              >
                마이페이지
              </Link>

              {/* 상태별: 인증 액션 */}
              {!authLoading && !isLoggedIn ? (
                <>
                  <Link
                    href="/login#top"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-900/5 dark:text-gray-200 dark:hover:bg-white/10"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register#top"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-900/5 dark:text-gray-200 dark:hover:bg-white/10"
                  >
                    회원가입
                  </Link>
                </>
              ) : (
                <button
                  onClick={onLogout}
                  className="text-left rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-900/5 dark:text-gray-200 dark:hover:bg-white/10"
                >
                  로그아웃
                </button>
              )}

              {/* 요금제 보기 버튼 (항상 노출) */}
              <button
                onClick={() => { setMenuOpen(false); setShowPricing(true); }}
                className="text-left rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-900/5 dark:text-gray-200 dark:hover:bg-white/10"
              >
                요금제 보기
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* 요금제 모달 */}
      {showPricing && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowPricing(false)}
        >
          <div
            className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">요금제</h2>
              <button
                onClick={() => setShowPricing(false)}
                className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg:white/10"
                aria-label="close pricing modal"
              >
                ✕
              </button>
            </div>

            {/* 요금제 카드 */}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {/* Standard */}
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-900">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Standard</h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">기업 사용</p>
                  </div>
                  <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:border-white/10 dark:text-zinc-300">
                    월
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-white">₩19,000</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">/월</span>
                </div>

                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
                  <li>모든 음원 사용 가능</li>
                  <li>리워드 적립</li>
                </ul>

                {/* 로그인된 경우만 구독 버튼 표시 */}
                {isLoggedIn ? (
                  <button
                    onClick={() => openConfirm({ name: "Standard", price: 19000 })}
                    className="mt-5 h-10 w-full rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-white/10"
                  >
                    구독하기
                  </button>
                ) : (
                  <div className="mt-5 rounded-lg border border-amber-300/50 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-300/20 dark:bg-amber-500/10 dark:text-amber-300">
                    로그인 후 구독할 수 있어요.{" "}
                    <Link href="/login#top" className="underline underline-offset-2">로그인</Link> 또는{" "}
                    <Link href="/register#top" className="underline underline-offset-2">회원가입</Link>
                  </div>
                )}
              </div>

              {/* Business */}
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-900">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Business</h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">기업 전용</p>
                  </div>
                  <span className="rounded-full border border-zinc-200 px-2 py-0.5 text:[10px] font-semibold text-zinc-700 dark:border-white/10 dark:text-zinc-300">
                    월
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-white">₩29,000</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">/월</span>
                </div>

                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
                  <li>모든 음원 사용 가능</li>
                  <li>더 많은 리워드 적립 횟수</li>
                </ul>

                {isLoggedIn ? (
                  <button
                    onClick={() => openConfirm({ name: "Business", price: 29000 })}
                    className="mt-5 h-10 w-full rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-white/10"
                  >
                    구독하기
                  </button>
                ) : (
                  <div className="mt-5 rounded-lg border border-amber-300/50 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-300/20 dark:bg-amber-500/10 dark:text-amber-300">
                    로그인 후 구독할 수 있어요.{" "}
                    <Link href="/login#top" className="underline underline-offset-2">로그인</Link> 또는{" "}
                    <Link href="/register#top" className="underline underline-offset-2">회원가입</Link>
                  </div>
                )}
              </div>
            </div>

            {/* 결제 확인 모달 (로그인 시에만) */}
            {confirmOpen && pendingPlan && isLoggedIn && (
              <div
                className="fixed inset-0 z-[101] flex items-center justify-center bg-black/30 p-4"
                aria-modal="true"
                role="dialog"
                onClick={() => setConfirmOpen(false)}
              >
                <div
                  className="w/full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-zinc-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 className="text-base font-semibold text-zinc-900 dark:text-white">
                    {pendingPlan.name} 구독
                  </h4>

                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    구독 금액{" "}
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      ₩{pendingPlan.price.toLocaleString()}
                    </span>
                    을 결제합니다.
                  </p>

                  <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-700 dark:text-zinc-300">보유 리워드</span>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {balance.toLocaleString()} 리워드
                      </span>
                    </div>

                    <div className="mt-2 flex items-end gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
                          사용할 리워드 (최대 {maxUsable.toLocaleString()} | 보유의 30%)
                        </label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={maxUsable}
                          value={useLeaders}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (isNaN(val)) setUseLeaders(0);
                            else setUseLeaders(Math.max(0, Math.min(val, maxUsable)));
                          }}
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            setUseLeaders(isNaN(val) ? 0 : val);
                          }}
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none
                                     focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                          placeholder={`0 ~ ${maxUsable.toLocaleString()}`}
                        />

                        <input
                          type="range"
                          min={0}
                          max={maxUsable}
                          value={clampedUse}
                          onChange={(e) => setUseLeaders(Number(e.target.value))}
                          className="mt-2 w-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseLeaders(maxUsable)}
                        className="mb-0.5 whitespace-nowrap rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium
                                   hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/10"
                      >
                        최대 사용
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-md bg-white p-2 text-center shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10">
                        <div className="text-zinc-500 dark:text-zinc-400">사용 예정</div>
                        <div className="mt-0.5 font-semibold text-zinc-900 dark:text-white">
                          {clampedUse.toLocaleString()}
                        </div>
                      </div>
                      <div className="rounded-md bg-white p-2 text-center shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10">
                        <div className="text-zinc-500 dark:text-zinc-400">남은 리워드</div>
                        <div className="mt-0.5 font-semibold text-zinc-900 dark:text-white">
                          {remainingAfterUse.toLocaleString()}
                        </div>
                      </div>
                      <div className="rounded-md bg-white p-2 text-center shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10">
                        <div className="text-zinc-500 dark:text-zinc-400">남은 결제</div>
                        <div className="mt-0.5 font-semibold text-zinc-900 dark:text-white">
                          ₩{remainingToPay.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => setConfirmOpen(false)}
                      className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-white/10"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => {
                        // TODO: 결제 API 호출
                        setConfirmOpen(false);
                        setShowPricing(false);
                      }}
                      disabled={clampedUse < 0 || clampedUse > maxUsable}
                      className="h-9 rounded-lg bg-zinc-900 px-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60
                                 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                    >
                      리워드로 결제
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
