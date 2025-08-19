import React, { useRef, useEffect, useState, useMemo } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import supabase from "../server/config";

interface VideoPlayerProps {
  filmPath: string;
  onEnded?: () => void;
}

const resolutions = ["1080p", "720p", "480p"];

const VideoPlayer: React.FC<VideoPlayerProps> = ({ filmPath, onEnded }) => {
  const videoRef = useRef<any>(null);
  const playerRef = useRef<any>(null);
  const [resolution, setResolution] = useState("1080p");

  const videoUrl = useMemo(() => {
    return supabase.storage.from(`films.${resolution}`).getPublicUrl(filmPath)
      .data.publicUrl;
  }, [resolution, filmPath]);

  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;

    const currentTime = playerRef.current?.currentTime?.() || 0;

    const initialize = () => {
      if (!playerRef.current) {
        playerRef.current = videojs(videoRef.current, {
          controls: true,
          responsive: true,
          fluid: true,
          sources: [{ src: videoUrl, type: "video/mp4" }],
        });
      } else {
        playerRef.current.src({ src: videoUrl, type: "video/mp4" });
        playerRef.current.ready(() => {
          playerRef.current?.currentTime(currentTime);
          playerRef.current?.play();
        });
      }

      // Always rebind ended listener
      if (onEnded) {
        playerRef.current.off("ended"); // remove old
        playerRef.current.on("ended", () => {
          console.log("video ended");
          onEnded();
        });
      }
    };

    requestAnimationFrame(initialize);

    return () => {
      if (playerRef.current) {
        playerRef.current.off("ended");
      }
    };
  }, [videoUrl, onEnded]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      <video ref={videoRef} className="video-js vjs-default-skin" playsInline />
      <FormControl sx={{ width: "20%", marginTop: "20px" }}>
        <InputLabel id="resolution-label">Resolution</InputLabel>
        <Select
          labelId="resolution-label"
          value={resolution}
          label="Resolution"
          sx={{ width: 100 }}
          fullWidth
          onChange={(e) => setResolution(e.target.value)}
        >
          {resolutions.map((res) => (
            <MenuItem key={res} value={res}>
              {res}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default VideoPlayer;
