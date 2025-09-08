// HeroClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchPopular } from "@/lib/api/musics"; 
import MusicDetailModal, { MusicDetail } from "./MusicDetailModal";

export type Track = {
  id: number;
  title: string;
  artist: string;
  price: number;
  coverUrl: string;
  views?: number;

  // 서버 계산 리워드(있으면 그대로 사용)
  reward_amount?: number;
  reward_total?: number;
  reward_remaining?: number;
};

type Playlist = { id: number; name: string };
type Tab = "popular" | "category";

/** 중복 id 제거 (최신 항목 우선) */
function uniqById(list: Track[]) {
  const map = new Map<number, Track>();
  for (const t of list) map.set(t.id, t);
  return Array.from(map.values());
}

/** 서버가 안 주면 프론트에서 임시 리워드 계산해서 채우기 */
function withMockRewards(t: Track, seed = 0): Track {
  const already =
    t.reward_amount !== undefined &&
    t.reward_total !== undefined &&
    t.reward_remaining !== undefined;

  if (already) return t;

  const amount = Math.max(0, Math.round(t.price ?? 0));
  const reward_amount = Math.max(1, Math.round(amount * 0.01)); // 가격의 1% (정수)
  const cap = 200 + ((seed * 13) % 150); // 월 최대 지급 횟수(모의)
  const used = Math.min(cap, Math.max(0, (t.views ?? 0) % cap));
  const reward_total = reward_amount * cap;
  const reward_remaining = Math.max(0, reward_total - reward_amount * used);

  return { ...t, reward_amount, reward_total, reward_remaining };
}

export default function HeroClient({
  categories = [],
  initialHotTracks = [],
  weeklyTop = [],
  headerOffset = 0,
}: {
  categories: string[];
  initialHotTracks: Track[];
  weeklyTop: Track[];
  headerOffset?: number;
}) {
  // 탭 & 리스트
  const [tab, setTab] = useState<Tab>("popular");
  const [selectedCategory, setSelectedCategory] = useState<string | null>("Pop");
  const [hotTracks, setHotTracks] = useState<Track[]>(initialHotTracks);

  /** 인기순(조회수) 기본 소스: weeklyTop이 10개 미만이면 initialHotTracks와 합쳐서 임시 보강 */
  const weeklySource = useMemo(() => {
    let base = weeklyTop ?? [];
    if ((base?.length ?? 0) < 10) {
      console.warn("[HeroClient] weeklyTop 개수가 기대치보다 적습니다.", {
        weeklyTopLength: base?.length ?? 0,
      });
      base = uniqById([...(weeklyTop ?? []), ...(initialHotTracks ?? [])]);
    }
    return base;
  }, [weeklyTop, initialHotTracks]);

  /** 조회수 내림차순 정렬 + 넉넉히 50개 확보 */
  const weeklyByViewsRaw = useMemo(() => {
    const sorted = [...weeklySource].sort(
      (a, b) => (b.views ?? 0) - (a.views ?? 0)
    );
    return sorted.slice(0, 50);
  }, [weeklySource]);

  /** 🔹 인기순에도 임시 리워드 주입(서버 값이 있으면 그대로 사용) */
  const weeklyByViews = useMemo(
    () => weeklyByViewsRaw.map((t, i) => withMockRewards(t, i)),
    [weeklyByViewsRaw]
  );

  // 디버그 로그
  useEffect(() => {
    console.group("[HeroClient] 인기순 디버그");
    console.debug("weeklySource.length:", weeklySource.length);
    console.debug(
      "weeklyByViews 샘플:",
      weeklyByViews.slice(0, 5).map((t) => ({
        id: t.id,
        views: t.views,
        reward_amount: t.reward_amount,
        reward_total: t.reward_total,
        reward_remaining: t.reward_remaining,
      }))
    );
    console.groupEnd();
  }, [weeklySource, weeklyByViews]);

  // 모달
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState<(MusicDetail & {
    reward_amount?: number;
    reward_total?: number;
    reward_remaining?: number;
  }) | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  //  카테고리 변경 → 인기곡 갱신
  useEffect(() => {
    if (!selectedCategory) return;
    (async () => {
      try {
        // fetchPopular로 카테고리 인기 가져오기
        const items = await fetchPopular({ category: selectedCategory, limit: 50 });

        // 백엔드 아이템을 Track으로 매핑
        const next = items.map((m, i) =>
          withMockRewards(
            {
              id: m.id,
              title: m.title,
              artist: m.artist,
              price: Number(m.price ?? m.amount ?? 0),
              coverUrl: m.cover ?? m.cover_image_url ?? "/placeholder.png",
              views: Number(m.views ?? 0),

              // 서버 리워드가 있으면 그대로 넣어둔다 (withMockRewards가 건들지 않음)
              reward_amount: (m as any).reward_amount,
              reward_total: (m as any).reward_total,
              reward_remaining: (m as any).reward_remaining,
            },
            i
          )
        );

        setHotTracks(next);

        console.group("[HeroClient] 카테고리 인기 디버그");
        console.debug("selectedCategory:", selectedCategory);
        console.debug("받은 items:", items?.length ?? 0);
        console.debug(
          "변환 후 hotTracks 샘플:",
          next.slice(0, 5).map((t) => ({
            id: t.id,
            views: t.views,
            reward_amount: t.reward_amount,
            reward_total: t.reward_total,
            reward_remaining: t.reward_remaining,
          }))
        );
        console.groupEnd();
      } catch (e) {
        console.error("[HeroClient] fetchPopular(category) 실패", e);
      }
    })();
  }, [selectedCategory]);

  // 상세
  async function fetchMusicDetail(id: number): Promise<
    MusicDetail & {
      reward_amount?: number;
      reward_total?: number;
      reward_remaining?: number;
    }
  > {
    const base = [...hotTracks, ...weeklyByViews].find((t) => t.id === id);
    const enriched = base ? withMockRewards(base) : undefined;

    return {
      id,
      title: base?.title ?? "",
      artist: base?.artist ?? "",
      cover: base?.coverUrl,
      // price: base?.price,
      lyrics: `
왜들 그리 다운돼있어? 뭐가 문제야 say something
"분위기가 겁나 싸해 요새는 이런 게 유행인가"
왜들 그리 재미없어? 아 그건 나도 마찬가지
Tell me what I got to do 급한 대로 블루투스 켜
아무 노래나 일단 틀어 아무거나 신나는 걸로
아무렇게나 춤춰 아무렇지 않아 보이게
아무 생각 하기 싫어 아무개로 살래 잠시
I'm sick and tired of my every day, keep it up 한 곡 더

아무 노래나 일단 틀어 아무렴 어때 it's so boring
아무래도 refresh가 시급한 듯해 쌓여가 스트레스가
배꼽 빠질 만큼만 폭소하고 싶은 날이야
What up my dawgs? 어디야 너희 올 때 병맥주랑 까까 몇 개 사 와 uh
...

La-la-la, la-la-la, la-la-la-la
아무 노래 아무 노래 아무 노래나 KOZ
`,
      company: { id: 1, name: "MPS Music", tier: "Business" },
      isSubscribed: false,
      reward_amount: enriched?.reward_amount,
      reward_total: enriched?.reward_total,
      reward_remaining: enriched?.reward_remaining,
    };
  }
  const handleSelect = async (id: number) => {
    const d = await fetchMusicDetail(id);
    setDetail(d);
    setModalOpen(true);
  };

  // 모달 액션
  const onSubscribe = async (_musicId: number) => {
    setDetail((prev) => (prev ? { ...prev, isSubscribed: true } : prev));
  };
  const onAddToPlaylist = async (musicId: number, playlistId: number) => {
    console.log("addToPlaylist", { musicId, playlistId });
  };
  const onCreatePlaylist = async (name: string) => {
    const pl = { id: Date.now(), name };
    setPlaylists((p) => [pl, ...p]);
    return pl;
  };

  return (
    <section
      className="relative z-0 min-h-[100svh] mt-10"
      style={{ paddingTop: headerOffset }}
    >
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-14">
        {/* 헤드라인 */}
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            구독으로 ·{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">
              모든음악{" "}
            </span>
            · 리워드 까지
          </h1>
          <p className="mt-4 text-sm md:text-base text-zinc-600 dark:text-white/70">
            블록체인 기반 정산 · 저작권 분쟁 없이, 구독 기간동안 필요한 음악을
            사용하세요.
          </p>
        </div>

        {/* 탭바 */}
        <div role="tablist" aria-label="HOT10 Tabs" className="mt-8 flex justify-center gap-2">
          <TabBtn active={tab === "popular"} onClick={() => setTab("popular")}>
            인기순
          </TabBtn>
          <TabBtn active={tab === "category"} onClick={() => setTab("category")}>
            카테고리별
          </TabBtn>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="mt-6">
          {tab === "popular" ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-neutral-200">
                  이번 주 가장 많은 사용 음악 (음악 사용 횟수)
                </h2>
              </div>
              <RankedList
                tracks={weeklyByViews}
                onSelect={handleSelect}
                initialVisible={5}
                maxVisible={10}
              />
            </>
          ) : (
            <>
              {/* 카테고리 칩 */}
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                {categories.length > 0
                  ? categories.map((c) => {
                      const isActive = selectedCategory === c;
                      return (
                        <button
                          key={c}
                          onClick={() =>
                            setSelectedCategory((prev) => (prev === c ? null : c))
                          }
                          className={`rounded-full border px-3 py-1.5 text-sm transition
                            ${
                              isActive
                                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white"
                                : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-white/15 dark:text-white/80 dark:hover:bg-white/5"
                            }`}
                        >
                          #{c}
                        </button>
                      );
                    })
                  : [...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-8 w-20 rounded-full bg-zinc-200 dark:bg-white/10 animate-pulse"
                      />
                    ))}
              </div>

              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-neutral-200">
                  {`카테고리별${selectedCategory ? ` - ${selectedCategory}` : "pop"} 순위(음악 사용 횟수)`}
                </h2>
              </div>
              <RankedList
                tracks={hotTracks}
                onSelect={handleSelect}
                initialVisible={5}
                maxVisible={10}
                emptyHint={
                  selectedCategory
                    ? "이 카테고리의 인기곡이 아직 없어요."
                    : "카테고리를 먼저 선택해주세요."
                }
              />
            </>
          )}
        </div>
      </div>

      {/* 상세 모달 */}
      <MusicDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={detail}
        myPlaylists={playlists}
        onSubscribe={onSubscribe}
        onAddToPlaylist={onAddToPlaylist}
        onCreatePlaylist={onCreatePlaylist}
      />
    </section>
  );
}

/** 탭 버튼 */
function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition
        ${
          active
            ? "bg-teal-300 text-black border-teal-300 shadow dark:bg-teal-300 dark:text-black dark:border-teal-300"
            : "bg-transparent text-zinc-900 border-zinc-300 hover:bg-zinc-50 dark:text-white/85 dark:border-white/20 dark:hover:bg-white/10"
        }`}
    >
      {children}
    </button>
  );
}

/** HOT10 리스트 (접이식) */
function RankedList({
  tracks,
  onSelect,
  initialVisible = 5,
  maxVisible = 11,
  emptyHint,
}: {
  tracks: Track[];
  onSelect?: (id: number) => void;
  initialVisible?: number;
  maxVisible?: number;
  emptyHint?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!tracks || tracks.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white/60 p-4 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
        {emptyHint ?? "항목이 없습니다."}
      </div>
    );
  }

  const shown = expanded
    ? tracks.slice(0, Math.min(maxVisible, tracks.length))
    : tracks.slice(0, Math.min(initialVisible, tracks.length));

  // 디버그
  useEffect(() => {
    console.group("[RankedList] 렌더 디버그");
    console.debug("tracks.length:", tracks.length);
    console.debug({ initialVisible, maxVisible, expanded, shownCount: shown.length });
    console.groupEnd();
  }, [tracks, expanded, initialVisible, maxVisible, shown.length]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/[.06]">
      <ul className="divide-y divide-zinc-200 dark:divide-white/10">
        {shown.map((m, idx) => {
          const rank = idx + 1;
          return (
            <li
              key={m.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50/80 dark:hover:bg-white/5 cursor-pointer"
              onClick={() => onSelect?.(m.id)}
            >
              <div className="w-8 text-center text-base font-bold text-emerald-700 dark:text-emerald-400">
                {rank}
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.coverUrl}
                alt={m.title}
                className="h-10 w-10 flex-none rounded object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="truncate text-zinc-900 dark:text-white text-sm">
                  {m.title}
                </div>
                <div className="truncate text-zinc-500 dark:text-white/70 text-xs">
                  by {m.artist}
                </div>

                {/* 리워드 뱃지 */}
                {(m.reward_amount ?? m.reward_total ?? m.reward_remaining) !== undefined && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {m.reward_amount !== undefined && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 px-3 py-0.5 text-[12px] font-semibold text-black shadow-md">
                        1회 {m.reward_amount} 리워드
                      </span>
                    )}
                    {m.reward_total !== undefined && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-0.5 text-[12px] font-medium text-amber-400 shadow-inner">
                        월 총 {m.reward_total} 리워드
                      </span>
                    )}
                    {m.reward_remaining !== undefined && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-0.5 text-[12px] font-medium text-emerald-400 shadow-inner">
                        남음 {m.reward_remaining} 리워드
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="ml-2 hidden sm:block text-sm font-medium text-zinc-900 dark:text-white">
                {/* 서버 값으로 바꾸고 싶으면: {Number(m.price).toLocaleString()} */}
                1회당 금액 8원
              </div>
            </li>
          );
        })}
      </ul>

      {/* 접이식 토글 */}
      {tracks.length > shown.length && !expanded && (
        <div className="p-3 text-center">
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-4 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-white/15 dark:text-white/80 dark:hover:bg-white/5"
          >
            더 보기 ▾
          </button>
        </div>
      )}
      {expanded && tracks.length > initialVisible && (
        <div className="p-3 text-center">
          <button
            onClick={() => setExpanded(false)}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-4 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-white/15 dark:text-white/80 dark:hover:bg-white/5"
          >
            접기 ▴
          </button>
        </div>
      )}
    </div>
  );
}
