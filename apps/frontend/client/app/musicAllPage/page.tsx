// app/(wherever)/MusicAllPage.tsx
// 다크/라이트 테마 대응 색상 최적화 버전 (검색 제거, 카테고리 칩만 사용)

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchCategories, fetchMusics, fetchPopular } from "@/lib/api/musics";
import type { Music, Category } from "@/lib/types/music";

/* ===================== Types ===================== */

type Tone = "emerald" | "amber" | "sky";

type Item = {
  id: number;
  cover: string;
  title: string;
  subtitle: string;
  playCount: number;   // 1회 리워드
  monthTotal: number;  // 월 총 리워드
  remain: number;      // 남은 리워드
};

type BadgeProps = {
  tone?: Tone;
  children: React.ReactNode;
  shine?: boolean;
};

type CardProps = Item;

type ShelfProps = {
  title: string;
  subtitle?: string;
  items: Item[];
  loading?: boolean;
};

type ChipProps = {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

type MusicAllPageProps = {
  newReleases?: Item[];
  charts?: Item[];
  moods?: Item[];
  showHero?: boolean;
};

/* ===================== Helpers ===================== */

const toItem = (m: Music): Item => ({
  id: m.id,
  cover: m.cover ?? m.cover_image_url ?? "/placeholder.png",
  title: m.title,
  subtitle: m.artist || "Unknown",
  playCount: Number(m.reward_amount ?? 0),
  monthTotal: Number(m.reward_total ?? 0),
  remain: Number(m.reward_remaining ?? 0),
});

/* ===================== Small UI ===================== */

const Star: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={props.className}>
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.8 6.2 20.7l1.1-6.6L2.5 9.4l6.6-.9L12 2.5z" />
  </svg>
);

/* 뱃지: 톤별 라이트/다크 테마 색상 */
const Badge: React.FC<BadgeProps> = ({ tone = "emerald", children, shine = false }) => {
  const base = "relative inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium overflow-hidden";
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

/* 카드: 다크/라이트 테마 색상 최적화, 고정폭 캐러셀 카드 */
const Card: React.FC<CardProps> = ({ cover, title, subtitle, playCount, monthTotal, remain }) => (
  <div className="
    group shrink-0 w-[260px] overflow-hidden rounded-2xl
    border border-black/5 dark:border-white/10
    bg-white dark:bg-zinc-900
    shadow-sm transition hover:shadow-md snap-start
  ">
    <div className="relative w-full aspect-[4/3] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cover} alt={`${title} cover`} className="h-full w-full object-cover" loading="lazy" />
      {/* Hover 가이드 */}
      <button className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
        <span className="rounded-full bg-black/70 px-4 py-2 text-xs tracking-wide text-white">미리듣기</span>
      </button>
    </div>
    <div className="p-4">
      <div className="cursor-pointer font-semibold leading-tight line-clamp-2 hover:underline text-zinc-900 dark:text-white">
        {title}
      </div>
      <div className="mt-0.5 text-sm text-zinc-500 dark:text-white/70">{subtitle}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone="emerald">
          <Star className="h-4 w-4" /> <span>1회 {playCount}</span>
        </Badge>
        <Badge tone="amber">월총 {monthTotal}</Badge>
        <Badge tone="sky">남음 {remain}</Badge>
      </div>
    </div>
  </div>
);

/* 가로 캐러셀: 스냅/스무스 스크롤 + 라이트/다크 버튼 색상 */
const Shelf: React.FC<ShelfProps> = ({ title, subtitle, items, loading }) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.floor(el.clientWidth * 0.8);
    el.scrollBy({ left: dir === "left" ? -delta : delta, behavior: "smooth" });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-sm text-zinc-500 dark:text-white/70">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          <button
            className="
              rounded-full border border-zinc-200 dark:border-white/15
              bg-white/90 dark:bg-white/10 backdrop-blur
              px-3 py-1 text-sm
              text-zinc-700 dark:text-white/80
              shadow-sm hover:bg-zinc-50 dark:hover:bg-white/15
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            "
            aria-label="왼쪽으로 스크롤"
            onClick={() => scrollBy("left")}
          >
            ←
          </button>
          <button
            className="
              rounded-full border border-zinc-200 dark:border-white/15
              bg-white/90 dark:bg-white/10 backdrop-blur
              px-3 py-1 text-sm
              text-zinc-700 dark:text-white/80
              shadow-sm hover:bg-zinc-50 dark:hover:bg-white/15
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            "
            aria-label="오른쪽으로 스크롤"
            onClick={() => scrollBy("right")}
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading
          ? [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="
                  shrink-0 w-[260px] h-[260px] rounded-2xl
                  border border-zinc-200 dark:border-white/10
                  bg-zinc-100 dark:bg-white/10
                  animate-pulse
                "
              />
            ))
          : items.map((t) => <Card key={t.id} {...t} />)}
      </div>
    </section>
  );
};

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

/* ===================== Page ===================== */

const MusicAllPage: React.FC<MusicAllPageProps> = ({
  newReleases,
  charts,
  moods,
  showHero = true,
}) => {
  const [loadingNew, setLoadingNew] = useState(!newReleases);
  const [loadingCharts, setLoadingCharts] = useState(!charts);
  const [loadingMoods, setLoadingMoods] = useState(!moods);

  const [catLoading, setCatLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string | number | null>(null);

  const [dataNew, setDataNew] = useState<Item[]>(newReleases ?? []);
  const [dataCharts, setDataCharts] = useState<Item[]>(charts ?? []);
  const [dataMoods, setDataMoods] = useState<Item[]>(moods ?? []);

  /* 카테고리 로드 */
  useEffect(() => {
    (async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
        setActiveCat(cats[0]?.category_name ?? null);
      } catch (e) {
        console.error("[MusicAllPage] fetchCategories 실패", e);
      } finally {
        setCatLoading(false);
      }
    })();
  }, []);

  /* 신보: 최신 */
  useEffect(() => {
    if (newReleases) return;
    (async () => {
      try {
        setLoadingNew(true);
        const page = await fetchMusics({ cursor: "first", limit: 12, sort: "new" });
        setDataNew(page.items.map(toItem));
      } catch (e) {
        console.error("[MusicAllPage] fetchMusics(new) 실패", e);
      } finally {
        setLoadingNew(false);
      }
    })();
  }, [newReleases]);

  /* 차트: 인기 */
  useEffect(() => {
    if (charts) return;
    (async () => {
      try {
        setLoadingCharts(true);
        const items = await fetchPopular({ limit: 12 });
        setDataCharts(items.map(toItem));
      } catch (e) {
        console.error("[MusicAllPage] fetchPopular 실패", e);
      } finally {
        setLoadingCharts(false);
      }
    })();
  }, [charts]);

  /* 무드/장르: 데모로 인기 재사용 */
  useEffect(() => {
    if (moods) return;
    (async () => {
      try {
        setLoadingMoods(true);
        const items = await fetchPopular({ limit: 12 });
        setDataMoods(items.map(toItem));
      } catch (e) {
        console.error("[MusicAllPage] fetchPopular(moods) 실패", e);
      } finally {
        setLoadingMoods(false);
      }
    })();
  }, [moods]);

  /* 카테고리 칩 클릭 → 해당 카테고리 인기 */
  const onClickCategory = async (c: Category) => {
    try {
      const key = c.category_name ?? String(c.category_id);
      setActiveCat(key);
      setLoadingCharts(true);
      const items = await fetchPopular({ category: key, limit: 12 });
      setDataCharts(items.map(toItem));
    } catch (e) {
      console.error("[MusicAllPage] fetchPopular(category) 실패", e);
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* 애니메이션 키프레임 */}
      <style>{`
        @keyframes shine { to { transform: translateX(200%); } }
        .animate-shine { animation: shine 1.8s infinite; }
      `}</style>

      {/* 상단: 카테고리 칩 바 (검색 제거) */}
      <div className="
        sticky top-0 z-10 mb-5 rounded-2xl
        border border-zinc-200 dark:border-white/10
        bg-white/80 dark:bg-zinc-900/70 backdrop-blur
        p-3
      ">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-white/85">카테고리</h3>
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {catLoading
            ? [...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-20 shrink-0 rounded-full bg-zinc-200 dark:bg-white/10 animate-pulse"
                />
              ))
            : categoryChips}
        </div>
      </div>

      {/* Hero 영역: 라이트/다크 그라디언트 */}
      {showHero && (
        <div className="
          mb-8 overflow-hidden rounded-3xl
          border border-zinc-200 dark:border-white/10
          bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50
          dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900
          p-8 text-zinc-900 dark:text-white shadow
        ">
          <div className="flex flex-col gap-2">
            <span className="text-sm leading-5 text-zinc-600 dark:text-white/70">둘러보기</span>
            <h2 className="text-2xl font-extrabold tracking-tight">
              지금 막 나온 트랙 · 에디터 추천 · 인기 급상승
            </h2>
            <p className="text-zinc-600 dark:text-white/70">
              섹션(선반)별 캐러셀로 탐색하세요.
            </p>
            <div className="mt-4 flex gap-2">
              <Badge tone="amber" shine>NEW 오늘 업데이트</Badge>
              <Badge tone="sky">장르 · 무드</Badge>
              <Badge tone="emerald">개인화 추천</Badge>
            </div>
          </div>
        </div>
      )}

      {/* 섹션(선반) */}
      <div className="space-y-10">
        <Shelf
          title="새로 올라온 곡"
          subtitle="오늘 막 올라온 트랙"
          items={dataNew}
          loading={loadingNew}
        />
        <Shelf
          title="차트 Charts"
          subtitle={activeCat ? `카테고리: ${activeCat}` : "이번 주 인기"}
          items={dataCharts}
          loading={loadingCharts}
        />
        <Shelf
          title="무드 & 장르 Moods & Genres"
          subtitle="상황별 추천"
          items={dataMoods}
          loading={loadingMoods}
        />
      </div>
    </div>
  );
};

export default MusicAllPage;