// app/Dosc/page.tsx
export default function Page() {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-8">
        {/* 상단 네비 (헤더처럼 보이는 탭) */}
        <nav
          aria-label="API Navigation"
          className="mb-10 flex items-center gap-6 border-b border-zinc-200 dark:border-white/10"
        >
          <a
            href="#music-api"
            className="relative pb-3 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            음악 API
            <span className="absolute bottom-0 left-0 h-[2px] w-full bg-transparent group-hover:bg-zinc-900 dark:group-hover:bg-white"></span>
          </a>
          <a
            href="#lyrics-api"
            className="relative pb-3 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            가사 API
          </a>
        </nav>
  
        <section id="music-api" className="scroll-mt-24 mb-12">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            음악 API
          </h2>
          <div className="mt-4 rounded-lg border border-zinc-200 p-8 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
          </div>
        </section>
  
        <section id="lyrics-api" className="scroll-mt-24">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            가사 API
          </h2>
          <div className="mt-4 rounded-lg border border-zinc-200 p-8 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
          </div>
        </section>
      </main>
    );
  }
  