"use client";

import { useMemo, useState, useEffect } from "react";

export type Purchase = {
  id: string;
  date: string;         // "2025-08-01 10:30"
  item: string;         // "Pro 월 구독"
  amount: number;       // + 금액(원)
  method?: string;      // "카드(****-1234)"
  // status 제거(요청사항)
};

export type MileageDelta = {
  id: string;
  at: string;           // "2025-08-05 11:20"
  reason: string;       // "다음 결제 할인 사용"
  delta: number;        // 음수만 표시(-100)
};

export default function SubscriptionModal({
  open,
  onClose,
  planName = "Business",
  nextBillingAt = "2025-09-14 00:00",
  autoRenew = true,
  purchases = [],
  minusList = [],
  onCancel,       // 구독 취소(자동갱신 해제)
  onResume,       // 자동갱신 재개
  /* ▼ 추가된 프로퍼티 ▼ */
  mileageBalance = 0,           // 현재 보유 리워드(마일리지) 총액
  planPrice,                    // 다음 결제 기준가(있으면 예상 청구액 표시)
  plannedReward = 0,            // 다음 결제에 사용할 예정 리워드(초깃값/제어형)
  onChangePlannedReward,        // 입력 변경 콜백(제어형 용)
  onApplyReward,                // “적용” 클릭 시 콜백
}: {
  open: boolean;
  onClose: () => void;
  planName?: string;
  nextBillingAt?: string;
  autoRenew?: boolean;
  purchases?: Purchase[];
  minusList?: MileageDelta[];
  onCancel?: () => void;
  onResume?: () => void;
  /* ▼ 추가된 프로퍼티 타입 ▼ */
  mileageBalance?: number;
  planPrice?: number;
  plannedReward?: number;
  onChangePlannedReward?: (value: number) => void;
  onApplyReward?: (value: number) => void;
}) {
 

  /* ----- 합계(차감 내역은 음수 합계) ----- */
  const totalMinus = useMemo(
    () => minusList.reduce((s, m) => s + (m.delta || 0), 0),
    [minusList]
  );

  /* ----- 다음 결제 시 사용할 리워드 UI 상태 (제어/비제어 모두 지원) ----- */
  const maxUse = Math.max(0, Math.floor(mileageBalance)); // 음수 방지 + 정수화
  const isControlled = typeof onChangePlannedReward === "function";
  const [localPlanned, setLocalPlanned] = useState<number>(
    clamp(plannedReward, 0, maxUse)
  );

  // 외부 plannedReward가 바뀌면 동기화(제어형 대비)
  useEffect(() => {
    if (isControlled) setLocalPlanned(clamp(plannedReward, 0, maxUse));
  }, [plannedReward, maxUse, isControlled]);

  const value = isControlled ? clamp(plannedReward, 0, maxUse) : localPlanned;

  const handleChange = (next: number) => {
    const v = clamp(Math.floor(next), 0, maxUse);
    if (isControlled) {
      onChangePlannedReward?.(v);
    } else {
      setLocalPlanned(v);
    }
  };

  const expectedCharge = typeof planPrice === "number"
    ? Math.max(0, Math.floor(planPrice - value))
    : undefined;
    
    if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        className="relative z-[1001] w-[mix(860px,94vw)] rounded-2xl bg-white text-zinc-900 shadow-xl
                   dark:bg-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 p-5"
      >
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">구독 정보</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              현재 플랜 <b>{planName}</b> · {autoRenew ? "자동갱신 ON" : "자동갱신 OFF"} · 다음 결제 예정일 <b>{nextBillingAt}</b>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50
                         dark:border-white/10 dark:hover:bg-white/10"
            >
              닫기
            </button>
          </div>
        </header>

        {/* 본문 */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* 구매 내역 (상태 컬럼 제거) */}
          <section className="rounded-xl border border-zinc-200 dark:border-white/10 overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-white/10 px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              구매 내역
            </div>
            <div className="max-h-[40vh] overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300">
                  <tr>
                    <th className="px-3 py-2 text-left">일시</th>
                    <th className="px-3 py-2 text-left">항목</th>
                    <th className="px-3 py-2 text-right">금액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
                  {purchases.length > 0 ? (
                    purchases.map((p) => (
                      <tr key={p.id}>
                        <td className="px-3 py-2">{p.date}</td>
                        <td className="px-3 py-2">{p.item}</td>
                        <td className="px-3 py-2 text-right">{p.amount.toLocaleString()}원</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-zinc-500 dark:text-zinc-400">
                        구매 내역이 없어요.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 마일리지 차감(마이너스) 목록 */}
          <section className="rounded-xl border border-zinc-200 dark:border-white/10 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 px-3 py-2">
              <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">마일리지 차감 목록</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">합계 {totalMinus}</div>
            </div>
            <div className="max-h-[40vh] overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300">
                  <tr>
                    <th className="px-3 py-2 text-left">일시</th>
                    <th className="px-3 py-2 text-left">사유</th>
                    <th className="px-3 py-2 text-right">변동</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
                  {minusList.length > 0 ? (
                    minusList.map((m) => (
                      <tr key={m.id}>
                        <td className="px-3 py-2">{m.at}</td>
                        <td className="px-3 py-2">{m.reason}</td>
                        <td className="px-3 py-2 text-right text-red-600 dark:text-red-400">{m.delta}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-zinc-500 dark:text-zinc-400">
                        차감 내역이 없어요.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ▼ 다음 결제 시 리워드 사용 설정 카드 ▼ */}
        <div className="mt-4 rounded-xl border border-zinc-200 dark:border-white/10 p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                다음 결제(<b>{nextBillingAt}</b>)에 사용할 리워드 설정
              </div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                보유 리워드: <b>{mileageBalance.toLocaleString()}원</b> · 사용 가능 최대치: <b>{maxUse.toLocaleString()}원</b>
                {!autoRenew && (
                  <span className="ml-2 inline-block rounded-md border border-amber-300/40 bg-amber-100/40 px-2 py-0.5 text-[11px] text-amber-800 dark:bg-amber-300/10 dark:text-amber-200">
                    자동갱신이 꺼져 있어요. 재개 시 설정이 적용됩니다.
                  </span>
                )}
              </div>
            </div>

            {typeof planPrice === "number" && (
              <div className="text-right">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">예상 청구 금액</div>
                <div className="text-base font-semibold">
                  {expectedCharge?.toLocaleString()}원
                  <span className="ml-1 text-xs text-zinc-500 dark:text-zinc-400">
                    (기준가 {planPrice.toLocaleString()} − 리워드 {value.toLocaleString()})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 입력 UI */}
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="range"
              min={0}
              max={maxUse}
              step={10}
              value={value}
              onChange={(e) => handleChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={maxUse}
                step={10}
                value={value}
                onChange={(e) => handleChange(Number(e.target.value))}
                className="w-36 rounded-md border border-zinc-300 px-2 py-1 text-right text-sm dark:border-white/10 dark:bg-white/5"
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-300">원</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => onApplyReward?.(value)}
              className="rounded-md bg-zinc-900 text-white px-3 py-2 text-sm hover:bg-zinc-800
                         dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              적용
            </button>
            <button
              onClick={() => handleChange(0)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50
                         dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
            >
              0원으로 초기화
            </button>
          </div>
        </div>

        {/* 현재 구독 카드 */}
        <div className="mt-4 rounded-xl border border-zinc-200 dark:border-white/10 p-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            현재 구독: <b>{planName}</b> · 자동갱신 {autoRenew ? "ON" : "OFF"} · 다음 결제일 <b>{nextBillingAt}</b>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {autoRenew ? (
              <button
                onClick={onCancel}
                className="rounded-md bg-zinc-900 text-white px-3 py-2 text-sm hover:bg-zinc-800
                           dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                구독 취소(현재 구독권 종료 시점부터 free)
              </button>
            ) : (
              <button
                onClick={onResume}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50
                           dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
              >
                자동갱신 재개
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------- Utils ---------------- */
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
