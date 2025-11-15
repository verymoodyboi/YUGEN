import * as React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChallengeHeader from "../features/challenges/components/challengeHeader";
import ChallengeTabs from "../features/challenges/components/challengeTabs";
import AppLayout from "../layouts/layout-main";
import PodiumDialog from "../features/challenges/components/podiumDialog";
import JoinChallengeDialog from "../features/challenges/components/challengeJoinDialog";
import { useChallenge } from "../features/challenges/useUseChallenges";

const ChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const challengeID = searchParams.get("challenge_id");
  const { userInfo, getAccessToken } = useAuth();

  // useChallenge Hook handles all fetching and mutation logic
  const {
    loading,
    challenge,
    challengeFilms,
    pendingFilms,
    podiumFilms,
    userVote,
    submittedFilm,
    handleVote,
    handleRemoveFilm,
    handleAcceptFilm,
    handleSaveChallenge,
    handleRemoveSubmission,
    setPodiumFilms,
  } = useChallenge(challengeID, userInfo);

  // --- Local UI State ---
  const [tabIndex, setTabIndex] = React.useState(0);
  const [join, setJoin] = React.useState(false);
  const [chooseDialog, setChooseDialog] = React.useState(false);
  const [challengeRules, setChallengeRules] = React.useState<string[]>([]);
  const [newRule, setNewRule] = React.useState("");
  const [selectedDeadline, setSelectedDeadline] = React.useState<
    "0" | "1 day" | "1 week" | "1 month" | null
  >(null);
  const [openPodiumDialog, setOpenPodiumDialog] = React.useState(false);

  // --- Parse challenge rules from backend ---
  React.useEffect(() => {
    if (challenge?.challenge_rules) {
      try {
        const parsed =
          typeof challenge.challenge_rules === "string"
            ? JSON.parse(challenge.challenge_rules)
            : challenge.challenge_rules;
        if (Array.isArray(parsed)) setChallengeRules(parsed);
      } catch (err) {
        console.error("Error parsing challenge rules:", err);
      }
    }
  }, [challenge?.challenge_rules]);

  // --- Local helper logic ---
  const handleAddRule = () => {
    if (newRule.trim()) {
      setChallengeRules((prev) => [...prev, newRule.trim()]);
      setNewRule("");
    }
  };

  const handleRemoveRule = (index: number) => {
    setChallengeRules((prev) => prev.filter((_, i) => i !== index));
  };

  const getFilmPlacement = () => {
    if (!submittedFilm) return null;
    const idx = challengeFilms.findIndex(
      (f) => f.film_uuid === submittedFilm.films.film_uuid
    );
    return idx !== -1 ? idx + 1 : null;
  };

  // --- Render ---
  return (
    <AppLayout>
      <div className="space-y-8 font-freckle text-emerald-950 bg-emerald-50">
        {/* Header / Spotlight */}
        <ChallengeHeader
          challenge={challenge}
          submittedFilm={submittedFilm}
          userInfo={userInfo}
          getFilmPlacement={getFilmPlacement}
          navigate={navigate}
          handleRemoveSubmission={() =>
            submittedFilm &&
            handleRemoveSubmission(submittedFilm.films.film_uuid)
          }
          setJoin={setJoin}
        />

        {/* Tabs (Films, Rules, etc.) */}
        <ChallengeTabs
          tabIndex={tabIndex}
          setTabIndex={setTabIndex}
          challenge={challenge}
          challengeFilms={challengeFilms}
          pendingFilms={pendingFilms}
          podiumFilms={podiumFilms}
          challengeRules={challengeRules}
          userVote={userVote}
          userInfo={userInfo}
          handleVote={handleVote}
          handleRemoveFilm={handleRemoveFilm}
          handleAcceptFilm={handleAcceptFilm}
          handleAddRule={handleAddRule}
          handleRemoveRule={handleRemoveRule}
          handleSaveChallenge={() =>
            handleSaveChallenge(challengeRules, selectedDeadline)
          }
          setSelectedDeadline={setSelectedDeadline}
          selectedDeadline={selectedDeadline}
          newRule={newRule}
          setNewRule={setNewRule}
          setOpenPodiumDialog={setOpenPodiumDialog}
          navigate={navigate}
          getAccessToken={getAccessToken}
        />

        {/* Manual Ranking (Admin) */}
        <PodiumDialog
          open={openPodiumDialog}
          challenge={challenge}
          challengeID={challengeID}
          challengeFilms={challengeFilms}
          podiumFilms={podiumFilms}
          setPodiumFilms={setPodiumFilms}
          onClose={() => setOpenPodiumDialog(false)}
        />

        {/* Film Join / Submit Dialog */}
        <JoinChallengeDialog
          join={join}
          setJoin={setJoin}
          chooseDialog={chooseDialog}
          setChooseDialog={setChooseDialog}
          challengeID={challengeID}
        />
      </div>
    </AppLayout>
  );
};

export default ChallengePage;
