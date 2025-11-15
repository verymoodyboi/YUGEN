// src/features/challenges/hooks/useChallenges.ts
import { useState, useEffect } from "react";
import {
  listAdminChallenges,
  listCommunityChallenges,
  listAcademicChallenges,
  listUserChallenges,
  getChallenge,
  getChallengeFilms,
  getMyFilms,
  submitFilm,
  toggleVote,
  getVote,
} from "./services"

export function useChallenges(getAccessToken?: () => Promise<string>) {
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [films, setFilms] = useState<any[]>([]);
  const [vote, setVote] = useState<any>(null);
  const [myFilms, setMyFilms] = useState<any[]>([]);

  /** Load public challenges */
  const loadChallenges = async (type: "admin" | "community" | "academic" | "user" = "admin") => {
    setLoading(true);
    try {
      let data;
      switch (type) {
        case "community":
          data = await listCommunityChallenges();
          break;
        case "academic":
          data = await listAcademicChallenges();
          break;
        case "user":
          data = await listUserChallenges();
          break;
        default:
          data = await listAdminChallenges();
      }
      setChallenges(data);
    } catch (err) {
      console.error("Error loading challenges:", err);
    } finally {
      setLoading(false);
    }
  };

  /** Load one challenge + its films */
  const loadChallengeDetails = async (id: string) => {
    if (!getAccessToken) return;
    setLoading(true);
    try {
      const token = await getAccessToken();
      const [meta, filmList] = await Promise.all([
        getChallenge(id, token),
        getChallengeFilms(id, token),
      ]);
      setSelectedChallenge(meta);
      setFilms(filmList);
    } catch (err) {
      console.error("Error loading challenge details:", err);
    } finally {
      setLoading(false);
    }
  };

  /** Get user’s submitted films */
  const loadMyFilms = async () => {
    if (!getAccessToken) return;
    setLoading(true);
    try {
      const token = await getAccessToken();
      const data = await getMyFilms(token);
      setMyFilms(data);
    } catch (err) {
      console.error("Error loading my films:", err);
    } finally {
      setLoading(false);
    }
  };

  /** Voting */
  const handleVote = async (id: string) => {
    if (!getAccessToken) return;
    try {
      const token = await getAccessToken();
      const result = await toggleVote(id, token);
      setVote(result);
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  /** Submitting film */
  const handleSubmitFilm = async (id: string, filmData: any) => {
    if (!getAccessToken) return;
    try {
      const token = await getAccessToken();
      await submitFilm(id, filmData, token);
      await loadChallengeDetails(id);
    } catch (err) {
      console.error("Error submitting film:", err);
    }
  };

  return {
    // state
    challenges,
    selectedChallenge,
    films,
    myFilms,
    vote,
    loading,
    // actions
    loadChallenges,
    loadChallengeDetails,
    loadMyFilms,
    handleVote,
    handleSubmitFilm,
  };
}
