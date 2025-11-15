// src/hooks/useChallenge.ts
import { useEffect, useState, useCallback } from "react";
import { ChallengeService } from "./services";

export function useChallenge(challengeID?: string | null, userInfo?: any) {
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<any>(null);
  const [challengeFilms, setChallengeFilms] = useState<any[]>([]);
  const [pendingFilms, setPendingFilms] = useState<any[]>([]);
  const [podiumFilms, setPodiumFilms] = useState<any[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [submittedFilm, setSubmittedFilm] = useState<any>(null);

  // === Fetch All ===
  const fetchAll = useCallback(async () => {
    if (!challengeID) return;
    try {
      setLoading(true);
      const [challenge, films, pending] = await Promise.all([
        ChallengeService.getChallenge(challengeID),
        ChallengeService.getChallengeFilms(challengeID),
        ChallengeService.getPendingFilms(challengeID),
      ]);
      setChallenge(challenge);
      setChallengeFilms(films);
      setPendingFilms(pending);
    } finally {
      setLoading(false);
    }
  }, [challengeID]);

  const fetchPodium = useCallback(async () => {
    if (!challengeID) return;
    const podium = await ChallengeService.getPodiumFilms(challengeID);
    setPodiumFilms(podium);
  }, [challengeID]);

  const fetchUserVote = useCallback(async () => {
    if (!challengeID || !userInfo) return;
    try {
      const vote = await ChallengeService.getUserVote(challengeID);
      setUserVote(vote);
    } catch {
      setUserVote(null);
    }
  }, [challengeID, userInfo]);

  const fetchSubmittedFilm = useCallback(async () => {
    if (!challengeID) return;
    try {
      const submission = await ChallengeService.getSubmittedFilm(challengeID);
      setSubmittedFilm(submission);
    } catch (err) {
      console.error("Error fetching submitted film:", err);
    }
  }, [challengeID]);

  // === Mutations ===
  const handleVote = async (filmUuid: string) => {
    const vote = await ChallengeService.vote(challengeID!, filmUuid);
    setUserVote(vote);
    fetchAll();
  };

  const handleRemoveFilm = async (filmUuid: string) => {
    await ChallengeService.removeFilm(challengeID!, filmUuid);
    fetchAll();
  };

  const handleAcceptFilm = async (filmUuid: string) => {
    await ChallengeService.acceptFilm(challengeID!, filmUuid);
    fetchAll();
  };

  const handleSaveChallenge = async (rules: string[], deadline?: string | null) => {
    await ChallengeService.saveChallenge(challengeID!, rules, deadline);
    fetchAll();
  };

  const handleRemoveSubmission = async (filmUuid: string) => {
    await ChallengeService.removeSubmission(challengeID!, filmUuid);
    setSubmittedFilm(null);
  };

const fetchUserFilms = async (getAccessToken: () => Promise<string | null>): Promise<any[]> => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error("No auth token found.");
    const films = await ChallengeService.getUserFilms(token);
    return films;
  } catch (error) {
    console.error("Error fetching user films:", error);
    alert("Failed to load your films.");
    return [];
  }
};

// === Submit selected film to a challenge ===
const handleSubmitFilm = async (
  challengeId: string,
  film_uuid: string,
  getAccessToken: () => Promise<string | null>
) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error("No auth token found.");
    await ChallengeService.submitFilm(challengeId, film_uuid, token);
    alert("Film submitted successfully!");
  } catch (error) {
    console.error("Error submitting film:", error);
    alert("Failed to submit film.");
  }
};


// Submit selected film to a challenge

// === Save podium winners ===
const savePodium = async (challengeId: string, podiumFilms: { rank: number; films: any }[]) => {
  const payload = podiumFilms
    .map((p) => {
      const uuid = p.films?.film_uuid ?? p.films?.uuid ?? p.films?.id ?? null;
      return uuid ? { rank: p.rank, film_uuid: uuid } : null;
    })
    .filter(Boolean);

  try {
    const requiredSlots = challenge?.podium ?? 3;
    if (payload.length !== requiredSlots) {
      alert("Please fill all podium slots before saving.");
      return;
    }

    // ✅ This should call the service, not itself
    await ChallengeService.savePodium(challengeId, payload);
    alert("Podium saved successfully!");
  } catch (error) {
    console.error("Save podium error:", error);
    alert("Failed to save podium");
  }
};

  // === Effects ===
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (challengeID && challenge?.ranking_system === "manual") {
      fetchPodium();
    }
  }, [challengeID, challenge?.ranking_system, fetchPodium]);

  useEffect(() => {
    fetchUserVote();
  }, [fetchUserVote]);

  useEffect(() => {
    fetchSubmittedFilm();
  }, [fetchSubmittedFilm]);

  return {
    loading,
    challenge,
    challengeFilms,
    pendingFilms,
    podiumFilms,
    userVote,
    submittedFilm,

    // Actions
    handleVote,
    handleRemoveFilm,
    handleAcceptFilm,
    handleSaveChallenge,
    handleRemoveSubmission,
    fetchAll,
    setPodiumFilms,
      savePodium,
      fetchUserFilms,
      handleSubmitFilm
  };
}
