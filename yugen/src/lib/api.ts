// src/lib/api.ts
import axios from "axios";
import supabase from "./supabaseClient";// or your auth util if different

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://try-yugen.com/api",
  headers: { "Content-Type": "application/json" },
});

// Dynamically inject access token before each request
api.interceptors.request.use(async (config) => {
  try {
    // Get current session token from Supabase (or any async provider)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn("⚠️ Could not attach auth token:", error);
  }

  return config;
});
