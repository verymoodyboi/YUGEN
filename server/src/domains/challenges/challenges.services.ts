// src/domains/challenges/challenges.services.ts
import supabase from "../../lib/supabase.js";
import type {
  Challenge,
  FilmSummary,
  CreateChallengeDTO,
  EditChallengeDTO,
  PodiumItem,
} from "./challenges.types.js";

/**
 * Note: supabase responses are typed as `any` here because
 * the SDK returns dynamic rows. We keep strict checks and throw when error.
 */

// ---------- LISTING ----------
export async function listChallenges(
  type: "admin" | "user" | "academic",
  offset = 0,
  limit = 5
): Promise<Challenge[]> {
  let query = supabase.from("challenges").select("*, users!inner(role, auth_id)");

  if (type === "admin") query = query.eq("users.role", "admin");
  if (type === "user") query = query.eq("users.role", "user");
  if (type === "academic") query = query.eq("is_academic", true);

  const { data, error } = await query.order("vote_count", { ascending: false }).range(offset, offset + limit - 1);

  if (error) throw new Error(error.message || "Supabase list error");

  return (data || []).map((row: any) => ({
    ...row,
    cover_path: row?.cover_path ? String(row.cover_path).replace(/\\/g, "/") : row?.cover_path,
  }));
}

export async function listUserChallenges(offset = 0, limit = 5, auth_id?: string): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*, users!inner(role, auth_id)")
    .eq("users.auth_id", auth_id)
    .order("vote_count", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message || "Supabase list user challenges error");

  return (data || []).map((row: any) => ({
    ...row,
    cover_path: row?.cover_path ? String(row.cover_path).replace(/\\/g, "/") : row?.cover_path,
  }));
}

// ---------- DETAILS ----------
export async function getChallenge(id: string): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from("challenges")
    .select(
      `
      challenge_id,
      challenge_name,
      challenge_discription,
      creator_id,
      end_date,
      cover_path,
      challenge_rules,
      film_count,
      vote_count,
      deadline,
      is_academic,
      allow_non_students,
      university_name,
      ranking_system,
      podium,
      creator:users!challenges_creator_id_fkey (
        auth_id,
        role,
        academic_status,
        username,
        pfp_path
      )
    `
    )
    .eq("challenge_id", id)
    .single();

  if (error) throw new Error(error.message || "Failed to fetch challenge");
  if (!data) return null;

  if (data.cover_path) data.cover_path = String(data.cover_path).replace(/\\/g, "/");

  return data as Challenge;
}

export async function getChallengeFilms(id: string): Promise<(FilmSummary & { vote_count?: number })[]> {
  const { data: challengeFilmsData, error: cfError } = await supabase
    .from("challenge_films")
    .select(`
      film_uuid,
      films:film_uuid (
        film_uuid,
        film_title,
        poster_path,
        release_date,
        avg_rating,
        uploader_id
      )
    `)
    .eq("challenge_uuid", id)
    .eq("is_accepted", true);

  if (cfError) throw new Error(cfError.message || "Failed to fetch challenge films");

  const { data: votesData, error: vError } = await supabase.from("challenge_votes").select("film_uuid").eq("challenge_id", id);
  if (vError) throw new Error(vError.message || "Failed to fetch votes");

  const votesMap: Record<string, number> = {};
  (votesData || []).forEach((r: any) => {
    votesMap[String(r.film_uuid)] = (votesMap[String(r.film_uuid)] || 0) + 1;
  });

  const filmsWithVotes = (challengeFilmsData || []).map((cf: any) => {
    const film = cf.films || {};
    return {
      ...film,
      poster_path: film.poster_path ? String(film.poster_path).replace(/\\/g, "/") : film.poster_path,
      vote_count: votesMap[String(film.film_uuid)] || 0,
    };
  });

  return filmsWithVotes.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
}

export async function getSubmission(challengeId: string, userId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from("challenge_films")
    .select(`
      is_accepted,
      films:film_uuid (
        film_uuid,
        film_title,
        poster_path,
        release_date,
        uploader_id
      )
    `)
    .eq("challenge_uuid", challengeId)
    .eq("films.uploader_id", userId)
    .maybeSingle();

  if (error && (error as any).code !== "PGRST116") throw new Error(error.message || "Failed to fetch submission");
  return data || null;
}

export async function getMyFilms(userId: string): Promise<FilmSummary[]> {
  const { data, error } = await supabase
    .from("films")
    .select("film_uuid, film_title, poster_path, film_path, release_date")
    .eq("uploader_id", userId);

  if (error) throw new Error(error.message || "Failed to fetch user films");
  return (data || []).map((f: any) => ({
    ...f,
    poster_path: f.poster_path ? String(f.poster_path).replace(/\\/g, "/") : f.poster_path,
  }));
}

// ---------- SUBMISSION ----------
export async function submitFilm(challengeId: string, userId: string, film_uuid: string) {
  if (!film_uuid) throw new Error("Missing film_uuid");

  const { data, error } = await supabase
    .from("challenge_films")
    .insert([{ film_uuid, challenge_uuid: challengeId }])
    .select(`
      is_accepted,
      films:film_uuid (
        film_uuid,
        film_title,
        poster_path,
        release_date
      )
    `)
    .single();

  if (error) throw new Error(error.message || "Failed to submit film");

  //  bypass TS error with cast
  const result = data as any;
  if (result?.films?.poster_path) {
    result.films.poster_path = String(result.films.poster_path).replace(/\\/g, "/");
  }

  return result;
}


export async function removeSubmission(challengeId: string, userId: string, film_uuid: string) {
  if (!film_uuid) throw new Error("Missing film_uuid");

  const { error } = await supabase.from("challenge_films").delete().eq("challenge_uuid", challengeId).eq("film_uuid", film_uuid);

  if (error && (error as any).code !== "PGRST116") throw new Error(error.message || "Failed to remove submission");
  return true;
}

// ---------- VOTING ----------
export async function getVote(challengeId: string, userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("challenge_votes")
    .select("film_uuid")
    .eq("challenge_id", challengeId)
    .eq("auth_id", userId)
    .maybeSingle();

  if (error && (error as any).code !== "PGRST116") throw new Error(error.message || "Failed to fetch vote");
  return data ? data.film_uuid : null;
}

export async function toggleVote(challengeId: string, userId: string, film_uuid: string) {
  if (!film_uuid) throw new Error("Missing film_uuid");

  const { data: existing, error: fetchError } = await supabase
    .from("challenge_votes")
    .select("film_uuid")
    .eq("challenge_id", challengeId)
    .eq("auth_id", userId)
    .maybeSingle();

  if (fetchError && (fetchError as any).code !== "PGRST116") throw new Error(fetchError.message || "Vote fetch error");

  if (existing && existing.film_uuid === film_uuid) {
    const { error: delErr } = await supabase.from("challenge_votes").delete().eq("challenge_id", challengeId).eq("auth_id", userId);
    if (delErr) throw new Error(delErr.message || "Failed to remove vote");
    return { vote: null, message: "Vote removed" };
  }

  // remove any existing
  await supabase.from("challenge_votes").delete().eq("challenge_id", challengeId).eq("auth_id", userId);

  const { error: insertError } = await supabase.from("challenge_votes").insert([{ challenge_id: challengeId, film_uuid, auth_id: userId }]);
  if (insertError) throw new Error(insertError.message || "Failed to insert vote");

  return { vote: film_uuid, message: "Vote added" };
}

// ---------- CREATION + MGMT ----------
export async function createChallenge(userId: string, dto: CreateChallengeDTO, file?: Express.Multer.File) {
  // Parse rules JSON
  let rules: any[] = [];
  try {
    rules = dto.challenge_rules ? JSON.parse(dto.challenge_rules) : [];
    if (!Array.isArray(rules)) rules = [];
  } catch {
    throw new Error("Invalid challenge_rules JSON");
  }

  let cover_path: string | null = null;
  if (file) {
    const fileName = `covers/${Date.now()}-${file.originalname}`;
    const { error: uploadError } = await supabase.storage.from("challenge_covers").upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });
    if (uploadError) throw new Error(uploadError.message || "Failed to upload cover");
    cover_path = fileName;
  }

  const { data, error } = await supabase
    .from("challenges")
    .insert([
      {
        creator_id: userId,
        challenge_name: dto.challenge_name,
        challenge_discription: dto.challenge_discription || null,
        challenge_rules: rules,
        is_academic: dto.is_academic === "true",
        allow_non_students: dto.allowNonStudents === "true",
        university_name: dto.uniName || null,
        deadline: dto.deadline || null,
        cover_path,
        created_at: new Date(),
        ranking_system: dto.rankingSystem || null,
        podium: dto.podium || null,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to create challenge");

  if (data.cover_path) data.cover_path = String(data.cover_path).replace(/\\/g, "/");
  return data as Challenge;
}

export async function getPendingFilms(challengeId: string) {
  const { data, error } = await supabase
    .from("challenge_films")
    .select(`
      is_accepted,
      submitted_at,
      films:film_uuid (
        film_uuid,
        film_title,
        poster_path,
        release_date,
        avg_rating,
        uploader_id
      )
    `)
    .eq("challenge_uuid", challengeId)
    .eq("is_accepted", false);

  if (error) throw new Error(error.message || "Failed to fetch pending films");

  return (data || []).map((row: any) => ({
    ...row.films,
    poster_path: row.films?.poster_path ? String(row.films.poster_path).replace(/\\/g, "/") : row.films?.poster_path,
    is_accepted: row.is_accepted,
    submitted_at: row.submitted_at,
  }));
}

export async function acceptFilm(challengeId: string, filmUuid: string) {
  const { error } = await supabase.from("challenge_films").update({ is_accepted: true }).eq("challenge_uuid", challengeId).eq("film_uuid", filmUuid);
  if (error) throw new Error(error.message || "Failed to accept film");
  return true;
}

export async function removeFilm(challengeId: string, filmUuid: string) {
  const { error } = await supabase.from("challenge_films").delete().eq("challenge_uuid", challengeId).eq("film_uuid", filmUuid);
  if (error) throw new Error(error.message || "Failed to remove film");
  return true;
}

export async function editChallenge(id: string, body: EditChallengeDTO) {
  const { data: challengeData, error: fetchErr } = await supabase.from("challenges").select("deadline").eq("challenge_id", id).single();
  if (fetchErr) throw new Error(fetchErr.message || "Failed to fetch challenge");

  let newDeadline = challengeData.deadline ? new Date(challengeData.deadline) : null;
  if (body.deadlineExtension && newDeadline) {
    if (body.deadlineExtension === "day") newDeadline.setDate(newDeadline.getDate() + 1);
    if (body.deadlineExtension === "week") newDeadline.setDate(newDeadline.getDate() + 7);
    if (body.deadlineExtension === "month") newDeadline.setMonth(newDeadline.getMonth() + 1);
  }

  const { error: updateErr } = await supabase
    .from("challenges")
    .update({
      deadline: newDeadline ? newDeadline.toISOString() : challengeData.deadline,
      challenge_rules: body.rules ? JSON.stringify(body.rules) : null,
    })
    .eq("challenge_id", id);

  if (updateErr) throw new Error(updateErr.message || "Failed to edit challenge");
  return true;
}

// ---------- PODIUM ----------
export async function getPodium(challengeId: string) {
  const { data, error } = await supabase
    .from("podium_films")
    .select(`
      id,
      rank,
      films:film_uuid (
        film_uuid,
        film_title,
        poster_path
      )
    `)
    .eq("challenge_id", challengeId)
    .order("rank", { ascending: true });

  if (error) throw new Error(error.message || "Failed to fetch podium");
  return data || [];
}

export async function savePodium(challengeId: string, podium: PodiumItem[]) {
  const { error: delErr } = await supabase.from("podium_films").delete().eq("challenge_id", challengeId);
  if (delErr) throw new Error(delErr.message || "Failed to clear podium");

  const { data, error } = await supabase
    .from("podium_films")
    .insert(podium.map((p) => ({ ...p, challenge_id: challengeId })))
    .select(`
      id,
      rank,
      films:film_uuid(film_uuid, film_title, poster_path)
    `);

  if (error) throw new Error(error.message || "Failed to save podium");
  return data;
}
