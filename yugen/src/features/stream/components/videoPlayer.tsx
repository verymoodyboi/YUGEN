import React, { useRef, useEffect, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "../../../App.css";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type VjsPlayer = ReturnType<typeof videojs>;

type QualitySetting = "auto" | number;

interface QualityLevel {
  height?: number;
  enabled: boolean;
}

// Shape of the object returned by videojs-contrib-quality-levels
interface QualityLevelList {
  length: number;
  [index: number]: QualityLevel | undefined;
  on(
    type: "addqualitylevel",
    listener: (event: { qualityLevel: QualityLevel }) => void,
  ): void;
  off(
    type: "addqualitylevel",
    listener: (event: { qualityLevel: QualityLevel }) => void,
  ): void;
}

// The plugin adds `qualityLevels` to the player at runtime, so video.js's
// own types don't know about it.
type QualityPlayer = VjsPlayer & { qualityLevels?: () => QualityLevelList };

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

/* -------------------------------------------------------------------------- */
/* Quality plugin loading (once, shared by every player instance)             */
/* -------------------------------------------------------------------------- */

let qualityPluginPromise: Promise<void> | null = null;

const loadQualityPlugin = (): Promise<void> => {
  if (!qualityPluginPromise) {
    qualityPluginPromise = import(
      "videojs-contrib-quality-levels/dist/videojs-contrib-quality-levels.js"
    )
      .then(() => undefined)
      .catch((err: unknown) => {
        // Resolve anyway: the player works without the quality menu
        console.warn("Failed to load video quality plugin", err);
      });
  }
  return qualityPluginPromise;
};

/* -------------------------------------------------------------------------- */
/* Manual quality selector (plain DOM inside the video.js control bar)        */
/* All of its state lives in this closure; it removes itself on dispose.      */
/* -------------------------------------------------------------------------- */

const ITEM_CLASS = "cursor-pointer px-2 py-1 hover:bg-gray-700";

const setupQualitySelector = (
  player: VjsPlayer,
  levels: QualityLevelList,
): void => {
  let selected: QualitySetting = "auto";
  const heights: number[] = [];
  const items: Array<{ el: HTMLDivElement; quality: QualitySetting }> = [];

  const menu = document.createElement("div");
  menu.className =
    "vjs-quality-menu hidden absolute bottom-12 right-4 bg-black text-white p-2 rounded z-50";
  player.el().appendChild(menu);

  const updateHighlight = () => {
    items.forEach(({ el, quality }) => {
      el.classList.toggle("bg-blue-600", quality === selected);
    });
  };

  const setQuality = (height: QualitySetting) => {
    selected = height;
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      if (!level) continue;
      level.enabled = height === "auto" ? true : level.height === height;
    }
    updateHighlight();
  };

  const addItem = (label: string, quality: QualitySetting) => {
    const el = document.createElement("div");
    el.textContent = label;
    el.className = ITEM_CLASS;
    el.addEventListener("click", () => setQuality(quality));
    menu.appendChild(el);
    items.push({ el, quality });
  };

  const rebuildMenu = () => {
    menu.textContent = "";
    items.length = 0;
    addItem("Auto", "auto");
    [...heights]
      .sort((a, b) => b - a)
      .forEach((height) => addItem(`${height}p`, height));
    updateHighlight();
  };

  // Returns true if the height was new
  const trackHeight = (level: QualityLevel): boolean => {
    if (level.height && !heights.includes(level.height)) {
      heights.push(level.height);
      return true;
    }
    return false;
  };

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    if (level) trackHeight(level);
  }
  rebuildMenu();

  const handleAddLevel = (event: { qualityLevel: QualityLevel }) => {
    if (trackHeight(event.qualityLevel)) rebuildMenu();
  };
  levels.on("addqualitylevel", handleAddLevel);

  // Control-bar button that toggles the menu
  const qualityButton = document.createElement("button");
  qualityButton.className = "vjs-quality-selector vjs-menu-button vjs-control";
  qualityButton.setAttribute("type", "button");
  qualityButton.setAttribute("aria-label", "Quality");
  qualityButton.innerHTML =
    '<span class="vjs-icon-placeholder" aria-hidden="true"></span>';

  qualityButton.addEventListener("click", (e) => {
    e.preventDefault();
    qualityButton.appendChild(menu);
    menu.style.position = "absolute";
    menu.style.bottom = "40px";
    menu.style.right = "0";
    menu.classList.toggle("hidden");
  });

  const controlBarEl = player.getChild("controlBar")?.el();
  if (controlBarEl) {
    const children = controlBarEl.children;
    // Insert before the last control (fullscreen button)
    controlBarEl.insertBefore(
      qualityButton,
      children[children.length - 1] ?? null,
    );
  }

  player.on("dispose", () => {
    levels.off("addqualitylevel", handleAddLevel);
    qualityButton.remove();
    menu.remove();
  });
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  filmPath,
  film_uuid,
  onEnded,
  on70,
}) => {
  const [source, setSource] = useState<Source | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<VjsPlayer | null>(null);
  const watched70Ref = useRef(false);

  // Always call the latest callbacks without re-initializing the player.
  // (Before, handlers captured whatever functions existed at init time.)
  const onEndedRef = useRef(onEnded);
  const on70Ref = useRef(on70);
  useEffect(() => {
    onEndedRef.current = onEnded;
    on70Ref.current = on70;
  });

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
        if (!isMounted) return;
        setSource(
          response.ok
            ? { src: hlsUrl, type: "application/vnd.apple.mpegurl" }
            : { src: mp4Url, type: "video/mp4" },
        );
      } catch {
        if (isMounted) {
          setSource({ src: mp4Url, type: "video/mp4" });
        }
      }
    };

    void tryFetchHls();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [filmPath, film_uuid]);

  // Create the player once the source is known; swap the source afterwards
  useEffect(() => {
    if (!source) return;

    const existing = playerRef.current;
    if (existing) {
      watched70Ref.current = false;
      existing.src(source);
      return;
    }

    const el = videoRef.current;
    if (!el) return;

    let cancelled = false;

    const init = async () => {
      // Wait for the plugin so `qualityLevels` exists when the player is ready
      // (replaces the old retry-every-200ms polling loop)
      await loadQualityPlugin();
      if (cancelled || playerRef.current) return;

      const player = videojs(el, {
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
        const levels = (player as QualityPlayer).qualityLevels?.();
        if (levels) setupQualitySelector(player, levels);
      });

      player.on("ended", () => onEndedRef.current?.());

      player.on("timeupdate", () => {
        if (watched70Ref.current) return;
        const current = player.currentTime() || 0;
        const duration = player.duration() || 0;
        if (duration > 0 && current / duration >= 0.7) {
          watched70Ref.current = true;
          on70Ref.current?.();
        }
      });
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [source]);

  // Dispose on unmount (this also tears down the quality menu)
  useEffect(() => {
    return () => {
      const player = playerRef.current;
      if (player && !player.isDisposed()) {
        player.dispose();
      }
      playerRef.current = null;
    };
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
