"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type PlayerTrack = {
  id: number | string;
  title: string;
  artist: string;
  cover?: string;
  src: string;        // 실제 재생 URL은 필수!
  duration?: number;
};

type Ctx = {
  current: PlayerTrack | null;
  queue: PlayerTrack[];
  index: number;
  // 제어
  playTrack: (t: PlayerTrack, queue?: PlayerTrack[], startIndex?: number) => void;
  next: () => void;
  prev: () => void;
  // Footer에 자동재생 신호
  shouldAutoplay: boolean;
  consumeAutoplay: () => void;
};

const AudioPlayerContext = createContext<Ctx | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState<PlayerTrack | null>(null);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);

  const playTrack: Ctx["playTrack"] = (t, q, startIndex) => {
    if (q && q.length) {
      setQueue(q);
      setIndex(startIndex ?? 0);
    } else {
      setQueue([t]);
      setIndex(0);
    }
    setCurrent(t);
    setShouldAutoplay(true); // Footer가 감지해서 .play() 하도록 신호
  };

  const next = () => {
    if (!queue.length) return;
    const ni = (index + 1) % queue.length;
    setIndex(ni);
    setCurrent(queue[ni]);
    setShouldAutoplay(true);
  };

  const prev = () => {
    if (!queue.length) return;
    const pi = (index - 1 + queue.length) % queue.length;
    setIndex(pi);
    setCurrent(queue[pi]);
    setShouldAutoplay(true);
  };

  const consumeAutoplay = () => setShouldAutoplay(false);

  const value = useMemo(
    () => ({ current, queue, index, playTrack, next, prev, shouldAutoplay, consumeAutoplay }),
    [current, queue, index, shouldAutoplay]
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return ctx;
}
