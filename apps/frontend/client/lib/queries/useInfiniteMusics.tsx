import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { fetchMusics } from "@/lib/api/musics";
import type { Music, Page } from "@/lib/types/music"; 
type Cursor = number | "first";
type QK = ["musics", { category?: string | number; sort?: "new" | "popular" }];

export function useInfiniteMusics({
  category,
  sort = "new",
  pageSize = 12,
}: {
  category?: string | number;
  sort?: "new" | "popular";
  pageSize?: number;
} = {}) {
  return useInfiniteQuery<Page<Music>, Error, InfiniteData<Page<Music>>, QK, Cursor>({
    queryKey: ["musics", { category, sort }],
    initialPageParam: "first",
    queryFn: ({ pageParam }) =>
      fetchMusics({ cursor: pageParam, limit: pageSize, category, sort }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export const flattenPages = (data?: InfiniteData<Page<Music>>): Music[] =>
  data ? data.pages.flatMap((p) => p.items) : [];
