import React from "react";

// === Tab components ===
import AcceptedFilmsTab from "./acceptedFilmsTab";
import PendingFilmsTab from "./pendingFilmsTab";
import EditChallengeTab from "./editChallengeTab";

interface ChallengeTabsProps {
  /** Current tab index */
  tabIndex: number;
  setTabIndex: (index: number) => void;

  /** Shared data */
  challenge: any;
  challengeFilms: any[];
  pendingFilms: any[];
  podiumFilms: any[];
  challengeRules: string[];
  userVote: string | null;
  userInfo: any;

  /** Handlers */
  handleVote: (filmId: string) => void;
  handleRemoveFilm: (filmId: string) => void;
  handleAcceptFilm: (filmId: string) => void;
  handleAddRule: () => void;
  handleRemoveRule: (index: number) => void;
  handleSaveChallenge: () => void;

  /** UI state helpers */
  setSelectedDeadline: (val: string | null) => void;
  selectedDeadline: string | null;
  newRule: string;
  setNewRule: (val: string) => void;

  /** Extra controls for child tabs */
  setOpenPodiumDialog: (val: boolean) => void;
  navigate: (path: string) => void;
  getAccessToken: () => Promise<string>;
}

const ChallengeTabs: React.FC<ChallengeTabsProps> = ({
  tabIndex,
  setTabIndex,
  challenge,
  challengeFilms,
  pendingFilms,
  podiumFilms,
  challengeRules,
  userVote,
  userInfo,
  handleVote,
  handleRemoveFilm,
  handleAcceptFilm,
  handleAddRule,
  handleRemoveRule,
  handleSaveChallenge,
  setSelectedDeadline,
  selectedDeadline,
  newRule,
  setNewRule,
  setOpenPodiumDialog,
  navigate,
  getAccessToken,
}) => {
  return (
    <div className="bg-emerald-50 text-emerald-950 font-freckle p-2 rounded-lg">
      {/* === Tab Navigation Buttons === */}
      <div className="flex space-x-2 border-b border-emerald-900 pb-2 mb-4">
        {["Accepted Films", "Pending Films", "Edit Challenge"].map(
          (label, index) => (
            <button
              key={label}
              onClick={() => setTabIndex(index)}
              className={`py-2 px-4 rounded transition ${
                tabIndex === index
                  ? "bg-emerald-900 text-emerald-50"
                  : "text-emerald-900 hover:bg-emerald-200"
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      {/* === Tab Content === */}
      <div className="mt-4">
        {tabIndex === 0 && (
          <AcceptedFilmsTab
            challenge={challenge}
            challengeFilms={challengeFilms}
            podiumFilms={podiumFilms}
            userVote={userVote}
            handleVote={handleVote}
            handleRemoveFilm={handleRemoveFilm}
            setOpenPodiumDialog={setOpenPodiumDialog}
            navigate={navigate}
            getAccessToken={getAccessToken}
          />
        )}

        {tabIndex === 1 && (
          <PendingFilmsTab
            pendingFilms={pendingFilms}
            handleAcceptFilm={handleAcceptFilm}
            handleRemoveFilm={handleRemoveFilm}
          />
        )}

        {tabIndex === 2 && (
          <EditChallengeTab
            challenge={challenge}
            challengeRules={challengeRules}
            handleAddRule={handleAddRule}
            handleRemoveRule={handleRemoveRule}
            handleSaveChallenge={handleSaveChallenge}
            selectedDeadline={selectedDeadline}
            setSelectedDeadline={setSelectedDeadline}
            newRule={newRule}
            setNewRule={setNewRule}
            userInfo={userInfo}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
};

export default ChallengeTabs;
