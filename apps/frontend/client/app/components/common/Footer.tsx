// footer.tsx
"use client";

import FooterPlayer, { Track } from "../sections/FooterPlayer";
import { useAudioPlayer } from "@/app/providers/AudioPlayerProvider";

export default function Footer({ track }: { track: Track | null }) {
  const { current, next, prev, shouldAutoplay, consumeAutoplay } = useAudioPlayer();

  return (
    <FooterPlayer
    track={current}
    onNext={next}
    onPrev={prev}
    autoPlay={shouldAutoplay}
    onAutoPlayConsumed={consumeAutoplay}
    // onSubscribe, onAddToPlaylist 필요하면 여기서도 넘겨줘
  />
  );
}
