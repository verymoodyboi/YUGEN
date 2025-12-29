const startLoopingScroll = (
  textEl: HTMLSpanElement,
  containerEl: HTMLDivElement,
  speedMultiplier: number
) => {
  const overflow = textEl.scrollWidth - containerEl.clientWidth;
  if (overflow <= 2) return;

  const durationMs = Math.min(
    8000,
    Math.max(2000, Math.round(overflow * speedMultiplier))
  );

  let timeoutId: number | null = null;

  const start = () => {
    // force reflow so transition always restarts
    textEl.getBoundingClientRect();

    textEl.style.transition = `transform ${durationMs}ms linear`;
    textEl.style.transform = `translateX(-${overflow}px)`;
  };

  const resetAndRestart = () => {
    if (timeoutId) window.clearTimeout(timeoutId);

    timeoutId = window.setTimeout(() => {
      textEl.style.transition = "none";
      textEl.style.transform = "translateX(0)";

      requestAnimationFrame(() => {
        requestAnimationFrame(start);
      });
    }, 500); // ⏸ pause for 0.5s
  };

  // prevent stacking listeners
  textEl.removeEventListener("transitionend", resetAndRestart);
  textEl.addEventListener("transitionend", resetAndRestart);

  start();
};

export const startScroll = (
  titleEl: HTMLSpanElement | null,
  titleContainer: HTMLDivElement | null,
  genreEl: HTMLSpanElement | null,
  genreContainer: HTMLDivElement | null
) => {
  if (titleEl && titleContainer) {
    startLoopingScroll(titleEl, titleContainer, 10);
  }

  if (genreEl && genreContainer) {
    startLoopingScroll(genreEl, genreContainer, 30);
  }
};

export const resetScroll = (
  titleEl: HTMLSpanElement | null,
  genreEl: HTMLSpanElement | null
) => {
  if (titleEl) {
    titleEl.style.transition = "none";
    titleEl.style.transform = "translateX(0)";
    titleEl.removeEventListener("transitionend", () => {});
  }

  if (genreEl) {
    genreEl.style.transition = "none";
    genreEl.style.transform = "translateX(0)";
    genreEl.removeEventListener("transitionend", () => {});
  }
};