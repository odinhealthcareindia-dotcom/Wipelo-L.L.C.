"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

export type BackgroundVideoSource = { src: string; poster: string };

// Silent, looping, decorative footage that fills its positioned parent. It only plays while
// near the viewport, and "reduce motion" users get the still poster frame instead.
export function BackgroundVideo({ src, poster, className }: BackgroundVideoSource & { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(videoRef, { margin: "200px 0px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && !reduced) video.play().catch(() => {});
    else video.pause();
  }, [inView, reduced]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}
