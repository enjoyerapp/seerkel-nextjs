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
  onWatch?: (playDuration: number, percentage: number) => void;
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
        onWatch(video.currentTime, 5);
      }
      else if (percentage >= 10 && !watchedMilestones.current.has(10)) {
        watchedMilestones.current.add(10);
        onWatch(video.currentTime, 10);
      }
      else if (percentage >= 15 && !watchedMilestones.current.has(15)) {
        watchedMilestones.current.add(15);
        onWatch(video.currentTime, 15);
      }
      else if (percentage >= 20 && !watchedMilestones.current.has(20)) {
        watchedMilestones.current.add(20);
        onWatch(video.currentTime, 20);
      }
      else if (percentage >= 25 && !watchedMilestones.current.has(25)) {
        watchedMilestones.current.add(25);
        onWatch(video.currentTime, 25);
      }
      else if (percentage >= 30 && !watchedMilestones.current.has(30)) {
        watchedMilestones.current.add(30);
        onWatch(video.currentTime, 30);
      }
      else if (percentage >= 35 && !watchedMilestones.current.has(35)) {
        watchedMilestones.current.add(35);
        onWatch(video.currentTime, 35);
      }
      else if (percentage >= 40 && !watchedMilestones.current.has(40)) {
        watchedMilestones.current.add(40);
        onWatch(video.currentTime, 40);
      }
      else if (percentage >= 45 && !watchedMilestones.current.has(45)) {
        watchedMilestones.current.add(45);
        onWatch(video.currentTime, 45);
      }
      else if (percentage >= 50 && !watchedMilestones.current.has(50)) {
        watchedMilestones.current.add(50);
        onWatch(video.currentTime, 50);
      } else if (percentage >= 75 && !watchedMilestones.current.has(75)) {
        watchedMilestones.current.add(75);
        onWatch(video.currentTime, 75);
      } else if (percentage >= 90 && !watchedMilestones.current.has(90)) {
        watchedMilestones.current.add(90);
        onWatch(video.currentTime, 90);
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
