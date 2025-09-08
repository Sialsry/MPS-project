"use client";

import React, { useEffect, useMemo, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { IoPlay, IoPlaySkipBack, IoPlaySkipForward } from "react-icons/io5";
import { useAudioPlayer } from "../../providers/AudioPlayerProvider";

export type Track = {
  id: number;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;       // 재생용 mp3/mp4 등 (필수)
  durationSec?: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  initialIndex?: number;                  
  onUseSelected?: (trackIds: number[]) => Promise<void> | void; 
};

export default function PlaylistModal({
  isOpen,
  onClose,
  tracks,
  initialIndex = 0,
  onUseSelected,
}: Props) {
  const [index, setIndex] = useState(initialIndex);

  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const allChecked = useMemo(
    () => tracks.length > 0 && tracks.every(t => checked[t.id]),
    [tracks, checked]
  );
  const someChecked = useMemo(
    () => tracks.some(t => checked[t.id]),
    [tracks, checked]
  );

  // 전역 플레이어
  const { playTrack } = useAudioPlayer();

  // 모달 열릴 때 body 스크롤 잠금 + 초기화
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // 초기 인덱스/체크박스 초기화
    setIndex(Math.min(initialIndex, Math.max(0, tracks.length - 1)));
    const init: Record<number, boolean> = {};
    tracks.forEach(t => (init[t.id] = true));  // 기본 전체 선택
    setChecked(init);

    return () => {
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialIndex, tracks.map(t => t.id).join(",")]);

  // 키보드 단축키
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " ") {
        e.preventDefault();
        handlePlayCurrentAndClose(); // 스페이스로 현재곡 재생 + 닫기
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, index, tracks]);

  // ===== 재생 유틸 =====
  const toQueue = (list: Track[]) =>
    list.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      cover: t.coverUrl,
      src: t.audioUrl,
      duration: t.durationSec,
    }));

  const playQueueAndClose = (queueTracks: Track[], startIdx: number) => {
    if (!queueTracks.length) return;
    const queue = toQueue(queueTracks);
    const target = queue[startIdx];
    // 전역 큐 세팅 + 자동재생
    playTrack(target, queue, startIdx);
    // 바로 닫으면서 재생바로 넘어감
    onClose();
  };

  const handlePrev = () => {
    if (!tracks.length) return;
    const nextIdx = (index - 1 + tracks.length) % tracks.length;
    setIndex(nextIdx);
  };

  const handleNext = () => {
    if (!tracks.length) return;
    const nextIdx = (index + 1) % tracks.length;
    setIndex(nextIdx);
  };

  // 현재 인덱스부터 플레이리스트 전체 큐로 재생 + 닫기
  const handlePlayCurrentAndClose = () => {
    if (!tracks.length) return;
    playQueueAndClose(tracks, index);
  };

  // 선택된 곡들만 큐로 재생 + 닫기
  const handlePlaySelectedAndClose = () => {
    const selected = tracks.filter(t => checked[t.id]);
    if (!selected.length) return;
    // 시작곡은 선택 목록에서 현재 인덱스 곡을 우선, 없으면 첫 곡
    const currentId = tracks[index]?.id;
    const startIdx = Math.max(0, selected.findIndex(t => t.id === currentId));
    playQueueAndClose(selected, startIdx >= 0 ? startIdx : 0);
  };

  // 선택 사용하기
  const handleUseSelected = async () => {
    const ids = tracks.filter(t => checked[t.id]).map(t => t.id);
    if (!ids.length) return;
    await onUseSelected?.(ids);
  };

  // 체크박스 핸들러
  const toggleOne = (id: number) =>
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const setAll = (value: boolean) => {
    const next: Record<number, boolean> = {};
    tracks.forEach(t => (next[t.id] = value));
    setChecked(next);
  };

  if (!isOpen || !tracks.length) return null;

  const track = tracks[index];

  const fmt = (s?: number) => {
    const n = Math.max(0, Math.floor(s || 0));
    const m = Math.floor(n / 60).toString();
    const ss = String(n % 60).padStart(2, "0");
    return `${m}:${ss}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" aria-modal role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-[101] w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl dark:bg-zinc-900 md:p-6">
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">플레이리스트</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAll(true)}
              className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-white/10"
            >
              전체 선택
            </button>
            <button
              onClick={() => setAll(false)}
              className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-white/10"
            >
              전체 해제
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="닫기"
            >
              <RxCross2 className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
            </button>
          </div>
        </div>

        {/* 상단 액션바: 선택 재생 / 선택 사용 */}
        <div className="mb-3 flex items-center justify-between text-xs">
          <div className="text-zinc-500 dark:text-zinc-400">
            선택됨: {tracks.filter(t => checked[t.id]).length}/{tracks.length}
            {!someChecked ? " (없음)" : allChecked ? " (전체)" : ""}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlaySelectedAndClose}
              disabled={!someChecked}
              className="h-8 rounded-md bg-zinc-900 px-3 text-xs font-semibold text-white enabled:hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:enabled:hover:bg-zinc-100 disabled:opacity-50"
            >
              선택 재생 (닫고 재생)
            </button>
            <button
              onClick={handleUseSelected}
              disabled={!someChecked}
              className="h-8 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white enabled:hover:bg-blue-500 disabled:opacity-50"
            >
              선택 사용하기
            </button>
          </div>
        </div>

        {/* 본문: 좌(커버/컨트롤) / 우(트랙리스트) */}
        <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
          {/* 좌측 현재 트랙 + 컨트롤 */}
          <div className="rounded-2xl border border-black/5 bg-black/3 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex gap-4">
              {/* 커버 */}
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
                {track?.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" draggable={false} />
                )}
              </div>

              {/* 정보 + 컨트롤 */}
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-zinc-900 dark:text-white">{track?.title}</div>
                <div className="truncate text-sm text-zinc-600 dark:text-zinc-300">{track?.artist}</div>

                <div className="mt-2 flex items-center gap-2">
                  <button onClick={handlePrev} className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="이전 곡">
                    <IoPlaySkipBack className="h-6 w-6" />
                  </button>

                  {/* 현재 인덱스부터 전체 큐로 재생하고 닫기 */}
                  <button
                    onClick={handlePlayCurrentAndClose}
                    className="rounded-full bg-zinc-900 p-3 text-white hover:opacity-90 dark:bg-white dark:text-zinc-900"
                    aria-label="재생"
                    title="재생(닫고 재생)"
                  >
                    <IoPlay className="h-6 w-6 translate-x-[1px]" />
                  </button>

                  <button onClick={handleNext} className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="다음 곡">
                    <IoPlaySkipForward className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  재생 바는 화면 하단에 표시됩니다. 모달을 닫으면 바로 재생돼요.
                </div>
              </div>
            </div>
          </div>

          {/* 우측 트랙 리스트 (체크박스 + 행클릭 재생) */}
          <div className="max-h-[420px] overflow-auto rounded-2xl border border-black/5 dark:border-white/10">
            <ul className="divide-y divide-black/5 dark:divide-white/10">
              {tracks.map((t, i) => {
                const selectedRow = i === index;
                return (
                  <li
                    key={t.id}
                    className={`flex items-center gap-3 px-3 py-2 ${selectedRow ? "bg-black/5 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/10"}`}
                  >
                    {/* 체크박스 */}
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-zinc-900 dark:accent-white"
                      checked={!!checked[t.id]}
                      onChange={() => toggleOne(t.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label="선택"
                    />

                    {/* 커버(클릭 시 해당 곡부터 전체 큐로 재생 + 닫기) */}
                    <button
                      className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-200 dark:bg-zinc-800"
                      onClick={() => {
                        setIndex(i);
                        playQueueAndClose(tracks, i);
                      }}
                      title="이 곡부터 재생"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {t.coverUrl && <img src={t.coverUrl} alt={t.title} className="h-full w-full object-cover" draggable={false} />}
                    </button>

                    {/* 타이틀/아티스트 (텍스트 클릭도 재생) */}
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        setIndex(i);
                        playQueueAndClose(tracks, i);
                      }}
                      title="이 곡부터 재생"
                    >
                      <div className="truncate text-sm font-medium text-zinc-900 dark:text-white">{t.title}</div>
                      <div className="truncate text-xs text-zinc-600 dark:text-zinc-300">{t.artist}</div>
                    </button>

                    {/* 오른쪽 타임/액션 */}
                    <div className="ml-auto flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300">
                      {typeof t.durationSec === "number" ? <span>{fmt(t.durationSec)}</span> : null}

                      {/* 개별 재생 버튼 */}
                      <button
                        className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] hover:bg-zinc-50 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/10"
                        onClick={() => {
                          setIndex(i);
                          playQueueAndClose(tracks, i);
                        }}
                      >
                        재생
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* 하단 액션바(모바일 접근성 위해 한 번 더) */}
        {/* <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={handlePlaySelectedAndClose}
            disabled={!someChecked}
            className="h-9 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white enabled:hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:enabled:hover:bg-zinc-100"
          >
            선택 재생 (닫고 재생)
          </button>
          <button
            onClick={handleUseSelected}
            disabled={!someChecked}
            className="h-9 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white enabled:hover:bg-blue-500 disabled:opacity-50"
          >
            선택 사용하기
          </button>
        </div> */}
      </div>
    </div>
  );
}
