import logger from "../../lib/logger.js";
import supabase from "../../lib/supabase.js";
import { genreCache } from "./genreCache.js";
import type { WeekTop20Row, Film, ThoughtFilm } from "./recommendations.types.js";
import { generateEmbedding } from "../../lib/embedding.js";

export async function getHotThisWeek(offset: number, limit: number): Promise<Film[]> {
  const { data, error } = await supabase
    .from("week_top20")
    .select("id, films!inner(*)")
    .eq("films.is_flagged", false)
  .eq("films.moderation_status", "approved")
  .eq("films.poster_moderation_status", "approved")
    .range(offset, offset + limit - 1) as { data: WeekTop20Row[] | null; error: any };

  if (error) throw error;

  return (data || []).map((row) => ({
    ...row.films,
    poster_path: row.films?.poster_path?.replace(/\\/g, "/") ?? null,
  }));
}

export async function getPersonalized(user_id: string, offset: number, limit: number): Promise<Film[]> {
const { data: likedFilms, error: likedError } = await supabase
  .from("thoughtsv1")
  .select(`
    film_uuid,
    rating,
    films!inner (
      film_uuid,
      embedding,
      avg_rating,
      is_flagged,
      moderation_status,
      poster_moderation_status
    )
  `)
  .eq("auth_id", user_id)
  .gt("rating", 5)
  .eq("films.is_flagged", false)
  .eq("films.moderation_status", "approved")
  .eq("films.poster_moderation_status", "approved") as {
    data: ThoughtFilm[] | null
    error: any
  };


  if (likedError) throw likedError;
  if (!likedFilms || likedFilms.length === 0) return [];

  const embeddings = likedFilms
    .map((f) => {
      let emb = f.films?.embedding;
      if (!emb) return null;

      if (typeof emb === "string") {
        try {
          emb = JSON.parse(emb);
        } catch {
          emb = emb?.replace(/[\[\]{}]/g, "").split(",").map(Number);
        }
      }
      return Array.isArray(emb) ? emb : null;
    })
    .filter((e): e is number[] => Array.isArray(e));

  if (embeddings.length === 0) return [];

  const size = embeddings[0].length;
  const avgEmbedding = Array(size).fill(0);
  embeddings.forEach((emb) => emb.forEach((val, i) => (avgEmbedding[i] += val)));
  for (let i = 0; i < size; i++) avgEmbedding[i] /= embeddings.length;

  const { data: recs, error: recError } = await supabase.rpc("match_films_personalized", {
    query_embedding: avgEmbedding,
    match_count: limit,
    offset_val: offset,
  }) as { data: Film[] | null; error: any };

  if (recError) throw recError;

  return (recs || []).map((film) => ({
    ...film,
    poster_path: film.poster_path?.replace(/\\/g, "/") ?? null,
  }));
}

export async function getFilmsByGenre(genre: string, offset: number, limit: number): Promise<Film[]> {
  const cached = genreCache[genre];
  if (!cached) return [];
  return cached.films;
}
export async function getAllGenres() {
  try {
    const { data, error } = await supabase
      .from("genres")
      .select("genre, overview, films_count")
      .order("genre", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (err) {
    logger.error("getAllGenres error:", err);
    throw new Error("Failed to fetch genres");
  }
}


export async function fetchHomeRecommendations(userId?: string) {
  const { data: hottest } = await supabase
    .from("films")
    .select("*")
    .eq("is_flagged", false)
  .eq("moderation_status", "approved")
  .eq("poster_moderation_status", "approved")
    .order("popularity", { ascending: false })
    .limit(100);

  const { data: fresh } = await supabase
    .from("films")
    .select("*")
      .eq("is_flagged", false)
  .eq("moderation_status", "approved")
  .eq("poster_moderation_status", "approved")
    .gte("release_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("popularity", { ascending: false })
    .limit(100);

  let subscriptions: any[] = [];
  let watchlist: any[] = [];

  if (userId) {
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("artist_id")
      .eq("subscriber_id", userId);

    if (subs?.length) {
      const ids = subs.map((s) => s.artist_id);
      const { data } = await supabase
        .from("films")
        .select("*")
          .eq("is_flagged", false)
  .eq("moderation_status", "approved")
  .eq("poster_moderation_status", "approved")
        .in("uploader_id", ids)
        .order("popularity", { ascending: false })
        .limit(100);
      subscriptions = data?.sort(() => 0.5 - Math.random()) ?? [];
    }

    const { data: watch } = await supabase
      .from("watchlists_films")
      .select("film_id")

      .eq("watchlist_id", userId);

    if (watch?.length) {
      const ids = watch.map((w) => w.film_id);
      const { data } = await supabase
        .from("films")
        .select("*")
          .eq("is_flagged", false)
  .eq("moderation_status", "approved")
  .eq("poster_moderation_status", "approved")
        .in("film_uuid", ids)
        .order("popularity", { ascending: false })
        .limit(100);
      watchlist = data?.sort(() => 0.5 - Math.random()) ?? [];
    }
  }

  return { hottest, fresh, subscriptions, watchlist };
}





type FilmRow = {
  film_uuid: string;
  film_title?: string;
  thesis?: string;
  popularity?: number | null;
  release_date?: string | null;
  uploader_id?: string | null;
  embedding?: number[] | null;
  poster_path?: string | null;
  view_count?: number | null;
  avg_rating?: number | null;
};


export async function fetchSimilarFilms(filmUuid: string, userId?: string) {
  if (!filmUuid) return [];

  const { data: film, error: filmErr } = await supabase
    .from("films")
    .select("film_uuid, film_title, thesis, embedding")
      .eq("is_flagged", false)
  .eq("moderation_status", "approved")
  .eq("poster_moderation_status", "approved")
    .eq("film_uuid", filmUuid)
    .maybeSingle();

  if (filmErr || !film) {
    logger.error(" Failed to fetch target film", { filmUuid, filmErr });
    return [];
  }

  let targetEmbedding = film.embedding;

  if (!Array.isArray(targetEmbedding) || !targetEmbedding.length) {
    const text = `${film.film_title ?? ""} ${film.thesis ?? ""}`.trim();
    const gen = await generateEmbedding(text);
    if (!gen) {
      logger.warn(" Could not generate embedding for film", { filmUuid });
      return [];
    }
    targetEmbedding = gen;
    await supabase
      .from("films")
      .update({ embedding: gen })
      .eq("film_uuid", filmUuid);
    // logger.info(" Generated and saved missing embedding", { filmUuid });
  }

  const { data, error } = await supabase.rpc("match_similar_films", {
    query_embedding: targetEmbedding,
    exclude_uuid: filmUuid,
  });

  if (error) {
    logger.error(" pgvector similarity RPC failed", { error });
    return [];
  }

  return data ?? [];
}