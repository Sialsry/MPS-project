"use client";

import { useMemo, useState } from "react";
import PopularSection from "./sections/PopularSection";
import MusicDetailModal, { type MusicDetail } from "./sections/MusicDetailModal";

type PopularItem = {
  rank: number;
  id: number;
  title: string;
  artist: string;
  cover: string;
  amount: number;
};

export default function PageClient({
  popularList,
}: {
  popularList: { category_id: number; category_name: string; items: PopularItem[] }[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MusicDetail | null>(null);

  const myPlaylists = useMemo(
    () => [
      { id: 1, name: "출퇴근용" },
      { id: 2, name: "밤감성" },
      { id: 3, name: "집중모드" },
    ],
    []
  );

  const handleSelect = (item: PopularItem) => {
    setSelected({
      id: item.id,
      title: item.title,
      artist: item.artist,
      cover: item.cover,
      price: item.amount,
      isSubscribed: false,
      company: { id: 10, name: "MPS Records", tier: "Business" },
      lyrics:
        `밤하늘에 수놓은 별들 사이로\n` +
        `너의 목소리가 파도처럼 번져와\n\n` +
        `낯선 거리 끝에서 마주친 기억들\n` +
        `한 줄의 멜로디로 다시 피어나는 밤\n\n` +
        `[Hook]\n` +
        `손끝에 남은 온기처럼 사라지지 않을 이야기\n` +
        `눈을 감아도 들려오는 너의 이름 Midnight Drive\n\n` +
        `다음 절로 이어지고, 후렴은 다시 반복된다...`,
    });
    setOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {popularList.map(({ category_id, category_name, items }) => (
          <PopularSection
            key={category_id}
            items={items}
            categoryName={category_name}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <MusicDetailModal
        open={open}
        onClose={() => setOpen(false)}
        item={selected}
        myPlaylists={myPlaylists}
        onSubscribe={async (id) => {
          setSelected((p) => (p ? { ...p, isSubscribed: true } : p));
        }}
        onAddToPlaylist={async (musicId, playlistId) => {
          console.log("플레이리스트 추가", { musicId, playlistId });
        }}
        onCreatePlaylist={async (name) => {
          const id = Math.floor(Math.random() * 100000);
          return { id, name };
        }}
      />
    </div>
  );
}
