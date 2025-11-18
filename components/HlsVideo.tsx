import Hls from "hls.js";
import { useEffect, useRef } from "react";

function HlsVideo({
  src,
  muted,
  loop,
  isPlaying,
  onWatch
}: {
  src: string;
  muted: boolean;
  loop: boolean;
  isPlaying: boolean;
  onWatch?: (percentage: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const watchedMilestones = useRef(new Set<number>()); // Track which milestones we've called

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onWatch) return;

    const handleTimeUpdate = () => {
      const percentage = (video.currentTime / video.duration) * 100;

      // Check milestones
      if (percentage >= 5 && !watchedMilestones.current.has(5)) {
        watchedMilestones.current.add(5);
        onWatch(5);
      } else if (percentage >= 50 && !watchedMilestones.current.has(50)) {
        watchedMilestones.current.add(50);
        onWatch(50);
      } else if (percentage >= 75 && !watchedMilestones.current.has(75)) {
        watchedMilestones.current.add(75);
        onWatch(75);
      } else if (percentage >= 90 && !watchedMilestones.current.has(90)) {
        watchedMilestones.current.add(90);
        onWatch(90);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onWatch]);

  // Reset milestones when src changes
  useEffect(() => {
    watchedMilestones.current.clear();
  }, [src]);

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
