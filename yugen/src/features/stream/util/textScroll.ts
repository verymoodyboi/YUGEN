export const startScroll = (
  titleEl: HTMLSpanElement | null,
  titleContainer: HTMLDivElement | null,
  genreEl: HTMLSpanElement | null,
  genreContainer: HTMLDivElement | null
) => {
  if (titleEl && titleContainer) {
    const overflow = titleEl.scrollWidth - titleContainer.clientWidth;
    if (overflow > 2) {
      const durationMs = Math.min(6000, Math.max(1200, Math.round(overflow * 10)));
      titleEl.style.transition = `transform ${durationMs}ms linear`;
      titleEl.style.transform = `translateX(-${overflow}px)`;
    }
  }
  if (genreEl && genreContainer) {
    const overflow = genreEl.scrollWidth - genreContainer.clientWidth;
    if (overflow > 2) {
      const durationMs = Math.min(12000, Math.max(3000, Math.round(overflow * 30)));
      genreEl.style.transition = `transform ${durationMs}ms linear`;
      genreEl.style.transform = `translateX(-${overflow}px)`;
    }
  }
};

export const resetScroll = (
  titleEl: HTMLSpanElement | null,
  genreEl: HTMLSpanElement | null
) => {
  if (titleEl) {
    titleEl.style.transition = "transform 300ms ease";
    titleEl.style.transform = "translateX(0)";
  }
  if (genreEl) {
    genreEl.style.transition = "transform 300ms ease";
    genreEl.style.transform = "translateX(0)";
  }
};
