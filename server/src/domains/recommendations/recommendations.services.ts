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
  const baseQuery = supabase
    .from("films")
    .select(`
      *,
      users!fk_uploader (
        region,
        university
      )
    `)
    .eq("is_flagged", false)
    .eq("moderation_status", "approved")
    .eq("poster_moderation_status", "approved");

  const { data: hottest } = await baseQuery
    .order("popularity", { ascending: false })
    .limit(100);

  const { data: fresh } = await supabase
    .from("films")
    .select("*")
    .eq("is_flagged", false)
    .eq("moderation_status", "approved")
    .eq("poster_moderation_status", "approved")
    .gte(
      "release_date",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    )
    .order("popularity", { ascending: false })
    .limit(100);

  let subscriptions: any[] = [];
  let watchlist: any[] = [];
  let community: any[] = [];

  if (userId) {
    // Fetch current user
    const { data: currentUser } = await supabase
      .from("users")
      .select("region, university")
      .eq("auth_id", userId)
      .single();

    const userRegion = currentUser?.region;
    const userUniversity = currentUser?.university;

// COMMUNITY LOGIC
if (userRegion || userUniversity) {
  const { data: communityData } = await baseQuery.limit(300);

  if (communityData?.length) {
    // Find max popularity for normalization
    const maxPopularity =
      Math.max(...communityData.map((f: any) => Number(f.popularity) || 0)) || 1;

    community = communityData
      .map((film: any) => {
        const uploader = film.users;

        let communityWeight = 0;

        const sameRegion =
          uploader?.region && userRegion && uploader.region === userRegion;

        const sameUniversity =
          uploader?.university &&
          userUniversity &&
          uploader.university === userUniversity;

        if (sameRegion && sameUniversity) {
          communityWeight = 5;
        } else if (sameRegion) {
          communityWeight = 3;
        } else if (sameUniversity) {
          communityWeight = 3;
        }

        if (communityWeight === 0) return null;

        const normalizedPopularity =
          (Number(film.popularity) || 0) / maxPopularity;

        const popularityWeight = 4; // tune this if needed

        const finalScore =
          communityWeight + normalizedPopularity * popularityWeight;

        return { ...film, finalScore };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.finalScore - a.finalScore)
      .slice(0, 100);
  }
}


    // SUBSCRIPTIONS
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

    // WATCHLIST
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

  return { hottest, fresh, subscriptions, watchlist, community };
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


export async function fetchSimilarFilms(
  filmUuid: string,
  userId?: string
) {
  if (!filmUuid) return [];

  // 1️⃣ Fetch target film
  const { data: film, error: filmErr } = await supabase
    .from("films")
    .select("film_uuid, film_title, thesis, embedding")
    .eq("is_flagged", false)
    .eq("moderation_status", "approved")
    .eq("poster_moderation_status", "approved")
    .eq("film_uuid", filmUuid)
    .maybeSingle();

  if (filmErr || !film) return [];

  let targetEmbedding = film.embedding;

  // 2️⃣ Generate embedding if missing
  if (!Array.isArray(targetEmbedding) || !targetEmbedding.length) {
    const text = `${film.film_title ?? ""} ${film.thesis ?? ""}`.trim();
    const gen = await generateEmbedding(text);
    if (!gen) return [];

    targetEmbedding = gen;

    await supabase
      .from("films")
      .update({ embedding: gen })
      .eq("film_uuid", filmUuid);
  }

  // 3️⃣ Get similar films from pgvector
  const { data: similarFilms, error } = await supabase.rpc(
    "match_similar_films",
    {
      query_embedding: targetEmbedding,
      exclude_uuid: filmUuid,
    }
  );

  if (error || !similarFilms?.length) return [];

  // 🚫 If user is not logged in → return pure similarity
  if (!userId) {
    return similarFilms;
  }

  // 4️⃣ Fetch user community info
  const { data: currentUser } = await supabase
    .from("users")
    .select("region, university")
    .eq("auth_id", userId)
    .single();

  const userRegion = currentUser?.region ?? null;
  const userUniversity = currentUser?.university ?? null;

  // If user has no region/university → skip community boost
  if (!userRegion && !userUniversity) {
    return similarFilms;
  }

  // 5️⃣ Fetch uploader info for returned films
  const filmUuids = similarFilms.map((f: any) => f.film_uuid);

  const { data: enriched } = await supabase
    .from("films")
    .select(`
      film_uuid,
      users!fk_uploader (
        region,
        university
      )
    `)
    .in("film_uuid", filmUuids);

  if (!enriched?.length) return similarFilms;

  // Apply community boost
const ranked = similarFilms
  .map((sim: any) => {
    const film = enriched.find(
      (f: any) => f.film_uuid === sim.film_uuid
    );

    const uploader = film?.users?.[0]; // <--- fix

    let communityWeight = 0;

    const sameRegion = uploader?.region === userRegion;
    const sameUniversity = uploader?.university === userUniversity;

    if (sameRegion && sameUniversity) {
      communityWeight = 0.15;
    } else if (sameRegion || sameUniversity) {
      communityWeight = 0.08;
    }

    return {
      ...sim,
      finalScore: sim.similarity + communityWeight,
    };
  })
  .sort((a: any, b: any) => b.finalScore - a.finalScore);


  return ranked;
}
