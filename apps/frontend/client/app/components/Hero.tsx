import HeroClient from "./sections/HeroClient";
import { fetchCategories, fetchMusics } from "@/lib/api/musics";
import type { Music } from "@/lib/types/music";
import MusicExploreSection from "./sections/MusicExploreSection"

type Track = {
  id: number;
  title: string;
  artist: string;
  price: number;
  coverUrl: string;
};

export default async function Hero() {
  // 1) 카테고리 목록
  const categories = await fetchCategories();
  const categoryNames = categories.map((c) => c.category_name);

  // 2) 전체 음악 목록 (최대 100개)
  const musicsPage = await fetchMusics({ cursor: "first", limit: 100, sort: "popular" });
  const all = musicsPage.items;

  // 헬퍼: Music → Track
  const toTrack = (m: Music): Track => ({
    id: m.id,
    title: m.title,
    artist: m.artist || "Unknown",
    price: Number(m.price ?? m.amount ?? 0),
    coverUrl: m.cover || m.cover_image_url || "/placeholder.png",
  });

  // 3) 조회수 TOP 3 (HotTracks)
  const hotTracks = [...all]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 3)
    .map(toTrack);

  // 4) 최근 7일 TOP 6
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weekly = all.filter((m) => {
    const d = new Date(m.created_at ?? ""); // created_at 기반
    return Number.isFinite(d.getTime()) && d >= sevenDaysAgo;
  });

  const weeklyTop = weekly
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 6)
    .map(toTrack);

  // 5) 클라이언트 컴포넌트에 전달
  return (
    <>
    {/* <HeroClient
      categories={categoryNames}
      initialHotTracks={hotTracks}
      weeklyTop={weeklyTop}
      /> */}
    <MusicExploreSection showHero={true} stickyTopOffset={64} />
      </>
  );
}
