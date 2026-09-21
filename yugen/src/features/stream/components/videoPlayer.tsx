import React, { useRef, useEffect, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "../../../App.css";

// Global flag to avoid re-loading quality plugins multiple times
let qualityPluginsLoaded = false;

// Dynamically load quality plugins only once (they are optional)
const loadQualityPlugins = async () => {
  if (qualityPluginsLoaded) return;
  try {
    await Promise.all([
      import(
        "videojs-contrib-quality-levels/dist/videojs-contrib-quality-levels.js"
      ),
      import(
        "videojs-hls-quality-selector/dist/videojs-hls-quality-selector.js"
      ),
    ]);
    qualityPluginsLoaded = true;
  } catch (err) {
    console.warn(
      "Failed to load video quality plugins, manual selector will be used",
      err,
    );
    qualityPluginsLoaded = true; // prevent retries
  }
};

interface VideoPlayerProps {
  filmPath: string;
  film_uuid: string;
  onEnded?: () => void;
  on70?: () => void;
}

interface Source {
  src: string;
  type: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  filmPath,
  film_uuid,
  onEnded,
  on70,
}) => {
  const [source, setSource] = useState<Source | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  const watched70Ref = useRef(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const selectedQualityRef = useRef<"auto" | number>("auto");
  const menuItemsRef = useRef<
    Array<{ el: HTMLDivElement; quality: "auto" | number }>
  >([]);
  const qualityLevelsRef = useRef<any>(null);

  // Decide which source to use: HLS first, fallback to MP4
  useEffect(() => {
    if (!filmPath) return;

    const hlsUrl = `https://films-transcoded.try-yugen.com/${film_uuid}/playlist.m3u8`;
    const mp4Url = `https://cdn.try-yugen.com/${filmPath}`;

    let isMounted = true;
    const abortController = new AbortController();

    const tryFetchHls = async () => {
      try {
        const response = await fetch(hlsUrl, {
          method: "HEAD",
          signal: abortController.signal,
        });
        if (response.ok && isMounted) {
          setSource({ src: hlsUrl, type: "application/vnd.apple.mpegurl" });
          return;
        }
        if (isMounted) {
          setSource({ src: mp4Url, type: "video/mp4" });
        }
      } catch (error) {
        if (isMounted) {
          setSource({ src: mp4Url, type: "video/mp4" });
        }
      }
    };

    tryFetchHls();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [filmPath, film_uuid]);

  // Quality menu helpers
  const updateHighlight = () => {
    const selected = selectedQualityRef.current;
    menuItemsRef.current.forEach((item) => {
      const isSelected =
        (selected === "auto" && item.quality === "auto") ||
        (typeof selected === "number" &&
          typeof item.quality === "number" &&
          item.quality === selected);
      if (isSelected) {
        item.el.classList.add("bg-blue-600");
      } else {
        item.el.classList.remove("bg-blue-600");
      }
    });
  };

  const setQuality = (height: "auto" | number) => {
    const player = playerRef.current;
    if (!player || !qualityLevelsRef.current) return;

    selectedQualityRef.current = height;
    const levels = qualityLevelsRef.current;

    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      if (height === "auto") {
        level.enabled = true;
      } else {
        level.enabled = level.height === height;
      }
    }

    updateHighlight();
  };

  const rebuildMenu = (foundHeights: number[]) => {
    if (!menuRef.current) return;
    const menu = menuRef.current;
    menu.innerHTML = "";
    menuItemsRef.current = [];

    const autoItem = document.createElement("div");
    autoItem.innerText = "Auto";
    autoItem.className = "cursor-pointer px-2 py-1 hover:bg-gray-700";
    autoItem.onclick = () => setQuality("auto");
    menu.appendChild(autoItem);
    menuItemsRef.current.push({ el: autoItem, quality: "auto" });

    const sorted = [...foundHeights].sort((a, b) => b - a);
    sorted.forEach((height) => {
      const item = document.createElement("div");
      item.innerText = `${height}p`;
      item.className = "cursor-pointer px-2 py-1 hover:bg-gray-700";
      item.onclick = () => setQuality(height);
      menu.appendChild(item);
      menuItemsRef.current.push({ el: item, quality: height });
    });

    updateHighlight();
  };

  // Manual quality selector button (does not rely on videojs plugins)
  const addManualQualitySelector = (player: any, controlBar: any) => {
    const qualityButton = document.createElement("button");
    qualityButton.className =
      "vjs-quality-selector vjs-menu-button vjs-control";
    qualityButton.setAttribute("type", "button");
    qualityButton.setAttribute("aria-label", "Quality");
    qualityButton.innerHTML =
      '<span class="vjs-icon-placeholder" aria-hidden="true"></span>';

    qualityButton.onclick = (e) => {
      e.preventDefault();
      if (menuRef.current) {
        const menu = menuRef.current;
        qualityButton.appendChild(menu);
        menu.style.position = "absolute";
        menu.style.bottom = "40px";
        menu.style.right = "0";
        menu.classList.toggle("hidden");
      }
    };

    const controlBarEl = controlBar.el();
    if (controlBarEl) {
      const children = controlBarEl.children;
      const insertIndex = children.length - 1; // before fullscreen button
      controlBarEl.insertBefore(qualityButton, children[insertIndex]);
    }

    return qualityButton;
  };

  // Initialize player only when source and DOM element are ready
  useEffect(() => {
    if (!videoRef.current || !source || playerRef.current) return;

    // Ensure the video element is actually attached to the DOM
    const initPlayer = () => {
      if (playerRef.current) return;

      const player = videojs(videoRef.current!, {
        controls: true,
        fluid: true,
        responsive: true,
        html5: {
          vhs: {
            overrideNative: true,
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
        },
        sources: [source],
      });

      playerRef.current = player;

      player.ready(() => {
        // Try to get quality levels (may appear after plugin loads or natively)
        const setupQualitySelector = () => {
          const levels = (player.qualityLevels as any)?.();
          if (!levels) {
            // Retry if levels not yet available
            setTimeout(setupQualitySelector, 200);
            return;
          }

          qualityLevelsRef.current = levels;
          const foundHeights: number[] = [];

          const menu = document.createElement("div");
          menu.className =
            "vjs-quality-menu hidden absolute bottom-12 right-4 bg-black text-white p-2 rounded z-50";
          menuRef.current = menu;
          player.el().appendChild(menu);

          for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            if (level.height && !foundHeights.includes(level.height)) {
              foundHeights.push(level.height);
            }
          }
          foundHeights.sort((a, b) => b - a);
          rebuildMenu(foundHeights);

          levels.on("addqualitylevel", (event: any) => {
            const level = event.qualityLevel;
            if (level.height && !foundHeights.includes(level.height)) {
              foundHeights.push(level.height);
              foundHeights.sort((a, b) => b - a);
              rebuildMenu(foundHeights);
            }
          });

          const controlBar = player.getChild("controlBar");
          if (controlBar) {
            addManualQualitySelector(player, controlBar);
          }
        };

        setupQualitySelector();
      });

      player.on("ended", () => onEnded?.());

      player.on("timeupdate", () => {
        const current = player.currentTime() || 0;
        const duration = player.duration() || 0;
        if (
          !watched70Ref.current &&
          duration > 0 &&
          current / duration >= 0.7
        ) {
          watched70Ref.current = true;
          on70?.();
        }
      });
    };

    // Check if element is in DOM, otherwise wait for next frame
    if (document.body.contains(videoRef.current)) {
      initPlayer();
    } else {
      requestAnimationFrame(() => {
        if (videoRef.current && !playerRef.current) {
          initPlayer();
        }
      });
    }

    // Cleanup function for this effect (not the final cleanup)
    return () => {
      // We don't dispose here because the next effect handles cleanup on unmount
    };
  }, [source, onEnded, on70]);

  // Final cleanup on component unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
      if (menuRef.current) {
        menuRef.current.remove();
        menuRef.current = null;
      }
      qualityLevelsRef.current = null;
    };
  }, []);

  // Optionally load quality plugins (they might provide extra features but manual selector works without)
  useEffect(() => {
    loadQualityPlugins();
  }, []);

  if (!filmPath) {
    return (
      <div className="text-emerald-950 font-freckle text-center py-10">
        No film source provided.
      </div>
    );
  }

  if (!source) {
    return (
      <div className="text-emerald-950 font-freckle text-center py-10">
        Loading video...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
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
