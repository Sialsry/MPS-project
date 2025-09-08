"use client";

import { useState } from "react";
import Footer from "../common/Footer"; // 경로 맞게 수정
import { Track } from "../sections/FooterPlayer"; // 경로 맞게 수정

export default function FooterToggle() {
  const exampleTrack: Track = {
    id: 1,
    title: "Saturday Nights",
    artist: "Khalid",
    cover: "https://upload.wikimedia.org/wikipedia/en/9/94/Khalid_-_Suncity.png",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 240,
  };

  const [on, setOn] = useState(false);

  return (
    <>
      <button
        onClick={() => setOn((v) => !v)}
        className="fixed bottom-24 right-4 z-[60] rounded-full border border-white/15 bg-zinc-900/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur hover:bg-zinc-900"
      >
        {on ? "플레이어 끄기" : "플레이어 켜기"}
      </button>

      {on && <Footer track={exampleTrack} />}
    </>
  );
}
