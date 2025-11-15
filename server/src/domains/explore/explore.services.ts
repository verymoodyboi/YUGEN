// src/features/explore/explore.services.ts
import supabase from "../../lib/supabase";
import { Film } from "./explore.types";
export const getRandomFilms = async (limit = 50) => {
  const { data, error } = await supabase.rpc("get_random_films", { lim: limit });
  if (error) throw new Error(error.message);
  return data || [];
};
