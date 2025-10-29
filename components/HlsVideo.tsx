import Hls from "hls.js";
import { useEffect, useRef } from "react";

function HlsVideo({ src, muted, loop, isPlaying }: { src: string; muted: boolean; loop: boolean, isPlaying: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // ✅ Native support (Safari)
      video.src = src;

      isPlaying ? video.play() : video.pause()
    } else if (Hls.isSupported()) {
      // ✅ Use hls.js for other browsers
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      isPlaying ? video.play() : video.pause()

      return () => {
        hls.destroy();
      };
    } else {
      console.error("HLS not supported in this browser");
    }
  }, [src]);

  useEffect(() => {
    isPlaying ? videoRef.current!.play() : videoRef.current!.pause()
  }, [isPlaying])

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-contain bg-black"
      muted={muted}
      loop={loop}
      playsInline
      autoPlay
    />
  );
}

export default HlsVideo;
