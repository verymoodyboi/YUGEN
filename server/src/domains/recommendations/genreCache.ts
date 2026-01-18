import supabase from "../../lib/supabase.js";
import logger from "../../lib/logger.js";
import cron from "node-cron";

export const genreCache: Record<string, { films: any[]; lastFetched: Date }> = {};

async function fetchAndCacheGenre(genre: string) {
  const { data, error } = await supabase
    .from("films")
    .select("*")
.contains("film_genre", JSON.stringify([genre]))
    .order("view_count", { ascending: false })
    .limit(1000);

  if (error) throw error;

  const sorted = (data || [])
    .map((film) => ({
      ...film,
      popularity: (film.view_count || 0) * (film.avg_rating || 0),
      poster_path: film.poster_path?.replace(/\\/g, "/"),
    }))
    .sort((a, b) => b.popularity - a.popularity);

  genreCache[genre] = {
    films: sorted,
    lastFetched: new Date(),
  };

  logger.info(`Cached ${sorted.length} films for genre: ${genre}`);
}

export async function preloadAllGenres() {
  const { data: genres, error } = await supabase
    .from("genres")
    .select("genre");

  if (error) {
    logger.error("Failed to fetch genres:", error);
    return;
  }

  for (const g of genres || []) {
    const genre = g.genre;
    try {
      await fetchAndCacheGenre(genre);
    } catch (err) {
      logger.error(`Failed to cache genre ${genre}:`, err);
    }
  }
}

await preloadAllGenres();
logger.info("All genres cached successfully on server start");

cron.schedule("0 0 * * *", async () => {
  logger.info("Refreshing genre cache...");
  await preloadAllGenres();
});
