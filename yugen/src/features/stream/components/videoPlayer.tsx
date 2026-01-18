import { useRef, useEffect, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  filmPath: string;
  onEnded?: () => void;
  on70?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  filmPath,
  onEnded,
  on70,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<videojs.Player | null>(null);
  const watched70Ref = useRef(false);
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    if (!filmPath) return;

    setVideoUrl(`https://cdn.try-yugen.com/${filmPath}`);

    console.warn("Invalid film path:", filmPath);
  }, [filmPath]);

  useEffect(() => {
    if (!videoRef.current || playerRef.current || !videoUrl) return;

    const player = videojs(videoRef.current, {
      controls: true,
      preload: "auto",
      fluid: true,
      responsive: true,
      sources: [
        {
          src: videoUrl,
          type: "video/mp4",
        },
      ],
    });

    playerRef.current = player;

    player.on("ended", () => onEnded?.());

    player.on("timeupdate", () => {
      const current = player.currentTime();
      const duration = player.duration();
      if (!watched70Ref.current && duration > 0 && current / duration >= 0.7) {
        watched70Ref.current = true;
        on70?.();
      }
    });

    return () => {
      player.dispose();
      playerRef.current = null;
    };
  }, [videoUrl, onEnded, on70]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !videoUrl) return;

    const currentTime = player.currentTime();
    const wasPlaying = !player.paused();

    player.src({ src: videoUrl, type: "video/mp4" });

    player.one("loadedmetadata", () => {
      if (currentTime > 0) player.currentTime(currentTime);
      if (wasPlaying) player.play().catch(() => {});
    });
  }, [videoUrl]);

  if (!filmPath) {
    return (
      <div className="text-emerald-950 font-freckle text-center py-10">
        No film source provided.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center">
      <div data-vjs-player className="w-full max-w-5xl">
        <video
          ref={videoRef}
          className="video-js vjs-default-skin vjs-big-play-centered rounded-xl overflow-hidden"
          playsInline
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
