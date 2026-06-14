// src/features/stream/components/VideoPlayer.tsx
import { useRef, useEffect, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import supabase from "../../../lib/supabaseClient";

interface VideoPlayerProps {
  filmPath: string;
  onEnded?: () => void;
  on70?: () => void;
}

const resolutions = ["1080p", "720p", "480p"];

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  filmPath,
  onEnded,
  on70,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<videojs.Player | null>(null);
  const watched70Ref = useRef(false);
  const [resolution, setResolution] = useState("1080p");
  const [videoUrl, setVideoUrl] = useState<string>("");

  // Step 1: Load Supabase URL
  useEffect(() => {
    if (!filmPath) return;
    const { data } = supabase.storage
      .from(`films.${resolution}`)
      .getPublicUrl(filmPath);

    if (data?.publicUrl) {
      setVideoUrl(data.publicUrl);
    } else {
      console.warn("Invalid film path:", filmPath);
      setVideoUrl("");
    }
  }, [filmPath, resolution]);

  // Step 2: Initialize player safely *after* DOM is ready
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

  // Step 3: Update video source reactively
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
      {/* Video Player */}
      <div data-vjs-player className="w-full max-w-5xl">
        <video
          ref={videoRef}
          className="video-js vjs-default-skin vjs-big-play-centered rounded-xl overflow-hidden"
          playsInline
        />
      </div>

      {/* Resolution Selector */}
      <div className="mt-4 flex items-center gap-2">
        <label
          htmlFor="resolution"
          className="font-freckle text-emerald-950 text-lg"
        >
          Resolution:
        </label>
        <select
          id="resolution"
          value={resolution}
          onChange={(e) => {
            watched70Ref.current = false;
            setResolution(e.target.value);
          }}
          className="px-3 py-2 rounded-md border-2 border-emerald-950 bg-emerald-50 text-emerald-950 
                     font-freckle cursor-pointer hover:scale-105 transition-transform"
        >
          {resolutions.map((res) => (
            <option key={res} value={res}>
              {res}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default VideoPlayer;
