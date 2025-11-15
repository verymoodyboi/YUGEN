import supabase from "../../lib/supabase.js";
import { generateEmbedding } from "../../lib/embedding.js";
import {AdvancedSearchParams} from "./search.types.js"

export async function advancedSearch(params: AdvancedSearchParams) {
  const offset = parseInt(params.offset?.toString() ?? "0", 10);
  const limit = parseInt(params.limit?.toString() ?? "5", 10);
  const searchInput = params.query;

  if (!searchInput) {
    throw new Error("Missing query parameter");
  }

  // Generate embedding
  const searchVector = await generateEmbedding(searchInput);

  // Call Supabase RPC
  const { data, error } = await supabase.rpc("match_films", {
    query_embedding: searchVector,
    match_threshold: 0.7,
    match_count: offset + limit, // fetch enough rows
  });

  if (error) throw new Error(`Supabase RPC error: ${error.message}`);

  // Normalize and apply offset
  return (data ?? [])
    .slice(offset, offset + limit)
    .map((film: any) => ({
      ...film,
      poster_path: film.poster_path?.replace(/\\/g, "/"),
    }));
}
export async function searchFilms(query: any) {
  const offset = parseInt(query.offset as string) || 0;
  const limit = parseInt(query.limit as string) || 5;
  const searchInput = query.query as string;

  const { data, error } = await supabase
    .from("films")
    .select("*")
    .ilike("film_title", `${searchInput}%`)
    .order("popularity", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data.map((film: any) => ({
    ...film,
    poster_path: film.poster_path?.replace(/\\/g, "/"),
  }));
}

export async function searchAccounts(query: any) {
  const offset = parseInt(query.offset as string) || 0;
  const limit = parseInt(query.limit as string) || 5;
  const searchInput = query.query as string;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("username", `${searchInput}%`)
    .order("sub_count", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data.map((user: any) => ({
    ...user,
    pfp_path: user.pfp_path?.replace(/\\/g, "/"),
  }));
}

export async function searchPlaylists(query: any) {
  const offset = parseInt(query.offset as string) || 0;
  const limit = parseInt(query.limit as string) || 5;
  const searchInput = query.query as string;

  const { data, error } = await supabase
    .from("playlists")
    .select(`
      playlist_uuid,
      playlist_name,
      is_public,
      film_count,
      creator:users!inner (
        username,
        pfp_path
      ),
      playlist_films:playlists_films (
        film_index,
        films (
          film_uuid,
          film_title,
          poster_path,
          release_date,
          film_duration,
          popularity,
          avg_rating
        )
      )
    `)
    .ilike("playlist_name", `${searchInput}%`)
    .eq("is_public", true)
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data;
}

export async function combinedSearch(q: string) {
  if (!q?.trim()) return [];

  // Parallel queries for speed
  const [filmsRes, matchRes, accountsRes, challengesRes] = await Promise.all([
    supabase
      .from("films")
      .select("film_title, poster_path, film_uuid, popularity")
      .ilike("film_title", `%${q}%`)
      .order("popularity", { ascending: false })
      .limit(10),

    // Semantic search via embeddings
    supabase.rpc("match_films", {
      query_embedding: await generateEmbedding(q),
      match_threshold: 0.8,
      match_count: 10,
    }),

    supabase
      .from("users")
      .select("username, pfp_path, sub_count")
      .ilike("username", `%${q}%`)
      .order("sub_count", { ascending: false })
      .limit(10),

    supabase
      .from("challenges")
      .select("challenge_name, cover_path, challenge_id, vote_count")
      .ilike("challenge_name", `%${q}%`)
      .order("vote_count", { ascending: false })
      .limit(10),
  ]);

  // Handle potential RPC errors gracefully
  if (filmsRes.error) console.error("❌ film search error:", filmsRes.error);
  if (matchRes.error) console.error("❌ match_films error:", matchRes.error);
  if (accountsRes.error) console.error("❌ accounts search error:", accountsRes.error);
  if (challengesRes.error) console.error("❌ challenges search error:", challengesRes.error);

  const films = filmsRes.data ?? [];
  const matched = matchRes.data ?? [];
  const accounts = accountsRes.data ?? [];
  const challenges = challengesRes.data ?? [];

  // Merge traditional + semantic film results, prioritize title matches
  const seen = new Set<string>();
  const allFilms = [...films, ...matched].filter((f) => {
    if (seen.has(f.film_uuid)) return false;
    seen.add(f.film_uuid);
    return true;
  });

  const filmResults = allFilms.map((f) => ({
    type: "film",
    title: f.film_title,
    poster: f.poster_path?.replace(/\\/g, "/"),
    uuid: f.film_uuid,
  }));

  const accountResults = accounts.map((a) => ({
    type: "user",
    username: a.username,
    pfp: a.pfp_path?.replace(/\\/g, "/"),
  }));

  const challengeResults = challenges.map((c) => ({
    type: "challenge",
    challenge_name: c.challenge_name,
    cover: c.cover_path?.replace(/\\/g, "/"),
    challenge_id: c.challenge_id,
  }));

  return [...filmResults, ...accountResults, ...challengeResults];
}

export async function searchMentions(q: string) {
  const { data, error } = await supabase
    .from("users")
    .select("username, pfp_path")
    .ilike("username", `%${q}%`)
    .limit(10);

  if (error) throw error;
  return data || [];
}
