// app/components/sections/MusicExploreSection.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchCategories, fetchMusics, fetchPopular } from "@/lib/api/musics";
import type { Music, Category } from "@/lib/types/music";
import MusicDetailModal, { type MusicDetail } from "../sections/MusicDetailModal";

/* ---------------- Types ---------------- */
type Tone = "emerald" | "amber" | "sky";
type Item = {
  id: number;
  cover: string;
  title: string;
  subtitle: string;
  playCount: number;
  monthTotal: number;
  remain: number;
  category?: string;
  tags?: string[];
};
type BadgeProps = { tone?: Tone; children: React.ReactNode; shine?: boolean };
type CardProps = Item & { onOpen?: (it: Item) => void };
type ShelfProps = {
  title: string;
  subtitle?: string;
  items: Item[];
  loading?: boolean;
  onOpen?: (it: Item) => void;
  /** 자동 흐름(무한루프) 활성화 */
  autoFlow?: boolean;
  /** 이동 주기(ms). 기본 2000ms */
  intervalMs?: number;
};
type ChipProps = { active?: boolean; children: React.ReactNode; onClick?: () => void };
export type MusicExploreSectionProps = {
  newReleases?: Item[];
  charts?: Item[];
  moods?: Item[];
  showHero?: boolean;
  stickyTopOffset?: number;
};

/* ---------------- Helpers ---------------- */
const FALLBACK_TAGS = ["Chill", "Focus", "Night"];

const toItem = (m: Music): Item => {
  const tags =
    Array.isArray((m as any).tags) && (m as any).tags.length
      ? (m as any).tags.slice(0, 3)
      : FALLBACK_TAGS; // ▼ 태그 없으면 임시 태그 자동 주입

  return {
    id: m.id,
    cover: m.cover ?? (m as any).cover_image_url ?? "/placeholder.png",
    title: m.title,
    subtitle: m.artist || "Unknown",
    playCount: Number((m as any).reward_amount ?? 0),
    monthTotal: Number((m as any).reward_total ?? 0),
    remain: Number((m as any).reward_remaining ?? 0),
    category: (m as any).category_name ?? (m as any).category ?? undefined,
    tags,
  };
};

const Star: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={props.className}>
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.8 6.2 20.7l1.1-6.6L2.5 9.4l6.6-.9L12 2.5z" />
  </svg>
);

const Badge: React.FC<BadgeProps> = ({ tone = "emerald", children, shine = false }) => {
  const base =
    "relative inline-flex items-center gap-1 rounded-full px-3 py-[6px] text-[13px] font-medium overflow-hidden";
  const toneCls =
    tone === "emerald"
      ? " bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
      : tone === "amber"
      ? " bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
      : " bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300";
  return (
    <span className={base + toneCls}>
      {children}
      {shine && (
        <span className="pointer-events-none absolute inset-0 -translate-x-full animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      )}
    </span>
  );
};

/* ---------------- Card (약간 넓힘 + 태그/카테고리 아래 표시) ---------------- */
const Card: React.FC<CardProps> = ({
  cover,
  title,
  subtitle,
  playCount,
  monthTotal,
  remain,
  onOpen,
  ...raw
}) => (
  <div className="group shrink-0 w-[315px] overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm transition hover:shadow-md snap-start">
    <button
      type="button"
      onClick={() =>
        onOpen?.({
          id: (raw as any).id,
          cover,
          title,
          subtitle,
          playCount,
          monthTotal,
          remain,
          category: (raw as any).category,
          tags: (raw as any).tags,
        })
      }
      className="block w-full text-left"
    >
      {/* 4:3 비율 유지 */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img src={cover} alt={`${title} cover`} className="h-full w-full object-cover" loading="lazy" />
        <span className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
          <span className="rounded-full bg-black/70 px-4 py-2 text-xs tracking-wide text-white">자세히 보기</span>
        </span>
      </div>

      <div className="p-4">
        <div className="cursor-pointer text-[15px] font-semibold leading-tight line-clamp-2 group-hover:underline text-zinc-900 dark:text-white">
          {title}
        </div>
        <div className="mt-0.5 text-[13px] text-zinc-500 dark:text-white/70">{subtitle}</div>

        {/* 리워드 배지 */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="emerald">
            <Star className="h-4 w-4" /> <span>1회 {playCount}</span>
          </Badge>
          <Badge tone="amber">월총 {monthTotal}</Badge>
          <Badge tone="sky">남음 {remain}</Badge>
        </div>

        {/* 카테고리 & 태그 */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(raw as any).category && (
            <span className="inline-flex items-center rounded-full border border-zinc-200 dark:border-white/15 bg-zinc-50 dark:bg-white/10 px-2.5 py-0.5 text-[12px] text-zinc-700 dark:text-white/80">
              {(raw as any).category}
            </span>
          )}
          {Array.isArray((raw as any).tags) &&
            (raw as any).tags.slice(0, 3).map((t: string) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border border-zinc-200 dark:border-white/15 bg-white dark:bg-white/10 px-2.5 py-0.5 text-[12px] text-zinc-700 dark:text-white/80"
              >
                #{t}
              </span>
            ))}
        </div>
      </div>
    </button>
  </div>
);

/* ---------------- Shelf (2초 간격 자동 이동 + 버튼/hover 대응 + 무한루프) ---------------- */
const Shelf: React.FC<ShelfProps> = ({
  title,
  subtitle,
  items,
  loading,
  onOpen,
  autoFlow = true,
  intervalMs = 2000, // ▼ 2초 간격
}) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const hoverRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  // 무한루프 위해 2배 렌더
  const loopItems = useMemo(() => (items?.length ? [...items, ...items] : items), [items]);

  // 한 칸 이동 로직(카드 너비 + gap 만큼)
  const moveByOne = (dir: "left" | "right" = "right") => {
    const el = scrollerRef.current;
    if (!el) return;

    const first = el.querySelector<HTMLElement>("[data-card]");
    if (!first) return;

    const rect = first.getBoundingClientRect();
    const gapPx = parseInt(getComputedStyle(el).columnGap || "16", 10) || 16;
    const step = rect.width + gapPx;

    el.scrollBy({ left: dir === "right" ? step : -step, behavior: "smooth" });

    // 절반(원본 길이) 이상 가면 앞으로 점프
    const half = el.scrollWidth / 2;
    const targetLeft = el.scrollLeft + (dir === "right" ? step : -step);
    // 점프는 이동 완료 후 다음 tick에서 자연스럽게 처리
    window.setTimeout(() => {
      if (el.scrollLeft >= half - step) {
        const prev = el.style.scrollBehavior;
        el.style.scrollBehavior = "auto";
        el.scrollLeft = el.scrollLeft - half + step; // 위치 유지감 있게 보정
        el.style.scrollBehavior = prev || "";
      } else if (el.scrollLeft <= 0) {
        // 왼쪽으로 무한
        const prev = el.style.scrollBehavior;
        el.style.scrollBehavior = "auto";
        el.scrollLeft = el.scrollLeft + half - step;
        el.style.scrollBehavior = prev || "";
      }
    }, 350); // 스무스 스크롤 시간과 비슷하게
  };

  // 버튼 클릭 시도 동일한 이동 사용
  const scrollByButton = (dir: "left" | "right") => moveByOne(dir);

  // 자동 이동 타이머
  useEffect(() => {
    if (!autoFlow || loading || !items?.length) return;
    const start = () => {
      timerRef.current = window.setInterval(() => {
        if (!hoverRef.current) moveByOne("right");
      }, intervalMs) as unknown as number;
    };
    start();
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [autoFlow, intervalMs, loading, items?.length]);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-sm text-zinc-500 dark:text-white/70">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-full border border-zinc-200 dark:border-white/15 bg-white/90 dark:bg-white/10 backdrop-blur px-3 py-1 text-sm text-zinc-700 dark:text-white/80 shadow-sm hover:bg-zinc-50 dark:hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            onClick={() => scrollByButton("left")}
            aria-label="왼쪽으로 스크롤"
          >
            ←
          </button>
          <button
            className="rounded-full border border-zinc-200 dark:border-white/15 bg-white/90 dark:bg-white/10 backdrop-blur px-3 py-1 text-sm text-zinc-700 dark:text-white/80 shadow-sm hover:bg-zinc-50 dark:hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            onClick={() => scrollByButton("right")}
            aria-label="오른쪽으로 스크롤"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onMouseEnter={() => (hoverRef.current = true)}
        onMouseLeave={() => (hoverRef.current = false)}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading
          ? [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[315px] h-[236px] rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/10 animate-pulse"
              />
            ))
          : loopItems.map((t, idx) => (
              <div key={`${t.id}-${idx}`} data-card>
                <Card {...t} onOpen={onOpen} />
              </div>
            ))}
      </div>
    </section>
  );
};

/* ---------------- Chip ---------------- */
const Chip: React.FC<ChipProps> = ({ active = false, children, onClick }) => (
  <button
    onClick={onClick}
    className={
      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition " +
      (active
        ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/15 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15")
    }
  >
    {children}
  </button>
);

/* ---------------- Main Section ---------------- */
export default function MusicExploreSection({
  newReleases,
  charts,
  moods,
  showHero = true,
  stickyTopOffset = 0,
}: MusicExploreSectionProps) {
  const [loadingNew, setLoadingNew] = useState(!newReleases);
  const [loadingCharts, setLoadingCharts] = useState(!charts);
  const [loadingMoods, setLoadingMoods] = useState(!moods);
  const [catLoading, setCatLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string | number | null>(null);
  const [dataNew, setDataNew] = useState<Item[]>(newReleases ?? []);
  const [dataCharts, setDataCharts] = useState<Item[]>(charts ?? []);
  const [dataMoods, setDataMoods] = useState<Item[]>(moods ?? []);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<MusicDetail | null>(null);
  const [usage, setUsage] = useState<{ perRead: number; monthlyTotal: number; remaining: number }>();

  // categories
  useEffect(() => {
    (async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
        setActiveCat(cats[0]?.category_name ?? null);
      } catch (e) {
        console.error("[MusicExploreSection] fetchCategories 실패", e);
      } finally {
        setCatLoading(false);
      }
    })();
  }, []);

  // new releases
  useEffect(() => {
    if (newReleases) return;
    (async () => {
      try {
        setLoadingNew(true);
        const page = await fetchMusics({ cursor: "first", limit: 12, sort: "new" });
        setDataNew(page.items.map(toItem));
      } catch (e) {
        console.error("[MusicExploreSection] fetchMusics(new) 실패", e);
      } finally {
        setLoadingNew(false);
      }
    })();
  }, [newReleases]);

  // charts
  useEffect(() => {
    if (charts) return;
    (async () => {
      try {
        setLoadingCharts(true);
        const items = await fetchPopular({ limit: 12 });
        setDataCharts(items.map(toItem));
      } catch (e) {
        console.error("[MusicExploreSection] fetchPopular 실패", e);
      } finally {
        setLoadingCharts(false);
      }
    })();
  }, [charts]);

  // moods
  useEffect(() => {
    if (moods) return;
    (async () => {
      try {
        setLoadingMoods(true);
        const items = await fetchPopular({ limit: 12 });
        setDataMoods(items.map(toItem));
      } catch (e) {
        console.error("[MusicExploreSection] fetchPopular(moods) 실패", e);
      } finally {
        setLoadingMoods(false);
      }
    })();
  }, [moods]);

  // category click → reload charts
  const onClickCategory = async (c: Category) => {
    try {
      const key = c.category_name ?? String(c.category_id);
      setActiveCat(key);
      setLoadingCharts(true);
      const items = await fetchPopular({ category: key, limit: 12 });
      setDataCharts(items.map(toItem));
    } catch (e) {
      console.error("[MusicExploreSection] fetchPopular(category) 실패", e);
    } finally {
      setLoadingCharts(false);
    }
  };

  const categoryChips = useMemo(
    () =>
      (categories ?? []).map((c) => {
        const key = c.category_name ?? String(c.category_id);
        const active = activeCat === key;
        return (
          <Chip key={key} active={active} onClick={() => onClickCategory(c)}>
            #{key}
          </Chip>
        );
      }),
    [categories, activeCat]
  );

  // open modal from card
  const openModalFromItem = (it: Item) => {
    const detail: MusicDetail = {
      id: it.id,
      title: it.title,
      artist: it.subtitle,
      cover: it.cover,
      lyrics:
        "가사 준비중...\n\n(임시 데이터) 곡 상세 API 연결 시 실제 가사와 추가 메타데이터를 표기합니다.",
      company: { id: 0, name: "—" },
      isSubscribed: false,
    };
    setModalItem(detail);
    setUsage({ perRead: it.playCount, monthlyTotal: it.monthTotal, remaining: it.remain });
    setModalOpen(true);
  };

  // modal handlers (mock)
  const handleSubscribe = async (_musicId: number) => {
    setModalItem((prev) => (prev ? { ...prev, isSubscribed: true } : prev));
  };
  const handleAddToPlaylist = async (musicId: number, playlistId: number) => {
    console.log("addToPlaylist", { musicId, playlistId });
  };
  const handleCreatePlaylist = async (name: string) => {
    return { id: Math.floor(Math.random() * 1e6), name };
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <style>{`@keyframes shine { to { transform: translateX(200%); } } .animate-shine { animation: shine 1.8s infinite; }`}</style>

       {/* hero */}
       {showHero && (
        <div className="mb-8 overflow-hidden rounded-3xl border border-zinc-200 dark:border-white/10 bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-8 text-zinc-900 dark:text-white shadow">
          <div className="flex flex-col gap-2">
            <span className="text-sm leading-5 text-zinc-600 dark:text-white/70">둘러보기</span>
            <h2 className="text-2xl font-extrabold tracking-tight">지금 막 나온 트랙 · 카테고리별 차트 · 인기 급상승</h2>
            <p className="text-zinc-600 dark:text-white/70">섹션(선반)별 캐러셀로 탐색하세요.</p>
            <div className="mt-4 flex gap-2">
              <Badge tone="amber" shine>NEW 오늘 업데이트</Badge>
              <Badge tone="sky">장르 · 무드</Badge>
              <Badge tone="emerald">개인화 추천</Badge>
            </div>
          </div>
        </div>
      )}


      {/* sticky categories */}
      <div
        className="sticky z-10 mt-10 mb-5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur p-3"
        style={{ top: 70 }}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-white/85">카테고리</h3>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {catLoading
            ? [...Array(8)].map((_, i) => (
                <div key={i} className="h-8 w-20 shrink-0 rounded-full bg-zinc-200 dark:bg-white/10 animate-pulse" />
              ))
            : categoryChips}
        </div>
      </div>

   

      {/* shelves */}
      <div className="space-y-10">
        <Shelf
          title="새로 올라온 곡"
          subtitle="오늘 막 올라온 트랙"
          items={dataNew}
          loading={loadingNew}
          onOpen={openModalFromItem}
          autoFlow
          intervalMs={3000}
        />
        <Shelf
          title="차트 Charts"
          subtitle={activeCat ? `카테고리: ${activeCat}` : "이번 주 인기"}
          items={dataCharts}
          loading={loadingCharts}
          onOpen={openModalFromItem}
          autoFlow
          intervalMs={3000}
        />
        <Shelf
          title="무드 & 장르 Moods & Genres"
          subtitle="상황별 추천"
          items={dataMoods}
          loading={loadingMoods}
          onOpen={openModalFromItem}
          autoFlow
          intervalMs={3000}
        />
      </div>

      {/* modal */}
      <MusicDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={modalItem}
        myPlaylists={[]}
        onSubscribe={handleSubscribe}
        onAddToPlaylist={handleAddToPlaylist}
        onCreatePlaylist={handleCreatePlaylist}
        usage={usage}
      />
    </div>
  );
}
