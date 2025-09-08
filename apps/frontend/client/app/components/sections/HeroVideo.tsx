// HeroVideo.tsx
"use client";
import { useEffect, useRef } from "react";
import { LuSearch } from "react-icons/lu";

export default function HeroVideo() {
  const vidRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    const tryPlay = () => v.play().catch(() => {});
    const onVisibility = () => (document.hidden ? v.pause() : tryPlay());
    document.addEventListener("visibilitychange", onVisibility);
    tryPlay();
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    // ✔ 스택 분리 + 상대 포지션
    <section className="relative isolate w-full overflow-hidden bg-black h-[86svh] min-h-[650px]">
      <video
        key="/videos/blockchain.mp4"
        ref={vidRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/blockchain.mp4"
        poster="/images/hero-poster.jpg"
        autoPlay
        muted
        playsInline
        loop
        preload="metadata"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/75" />
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(80%_60%_at_50%_30%,transparent,rgba(0,0,0,0.4))]" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-sm font-medium text-teal-300/90">
          블록체인 B2B 저작권 · 스트리밍 · 구독 · 리워드 보상
        </p>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
          저작권 걱정없이 쓰는 <span className="text-teal-300">기업용 음악</span> 플랫폼
        </h1>
        <p className="mt-4 max-w-2xl text-white/85">구독권 사면 모든음악 사용가능 · 스트리밍 트래킹 · 코인 보상 자동 적립</p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-8 flex w-full max-w-2xl items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md"
        >
          <LuSearch className="shrink-0 text-white/80" size={20} />
          <input
            className="w-full bg-transparent text-white placeholder-white/60 outline-none"
            placeholder="음악, 아티스트, 앨범 검색"
          />
          <button
            type="button"
            className="shrink-0 rounded-full bg-teal-400 px-5 py-2 text-sm font-semibold text-black hover:bg-teal-300"
          >
            검색
          </button>
        </form>

        {/* <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/15">
            견적문의
          </a>
          <a className="rounded-full bg-teal-400 px-5 py-2 text-sm font-semibold text-black hover:bg-teal-300">
            요금제 보기
          </a>
        </div> */}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-white/70">▼</div>
      </div>
    </section>
  );
}
