import React from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SchoolIcon from "@mui/icons-material/School";

interface EditChallengeTabProps {
  challenge: any;
  challengeRules: string[];
  selectedDeadline: string | null;
  setSelectedDeadline: (val: string | null) => void;
  newRule: string;
  setNewRule: (val: string) => void;
  handleAddRule: () => void;
  handleRemoveRule: (index: number) => void;
  handleSaveChallenge: () => void;
  userInfo?: any;
  navigate?: (path: string) => void;
}

const EditChallengeTab: React.FC<EditChallengeTabProps> = ({
  challenge,
  challengeRules,
  selectedDeadline,
  setSelectedDeadline,
  newRule,
  setNewRule,
  handleAddRule,
  handleRemoveRule,
  handleSaveChallenge,
  userInfo,
  navigate,
}) => {
  return (
    <div className="p-4 overflow-y-auto max-h-[60vh] text-emerald-950">
      <h3 className="text-lg font-bold mb-3">Extend deadline</h3>

      <div className="flex gap-2 mb-4">
        {["0", "1 day", "1 week", "1 month"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedDeadline(type as any)}
            className={`py-2 px-3 rounded transition ${
              selectedDeadline === type
                ? "bg-emerald-600 text-white"
                : "bg-transparent text-emerald-900 border border-emerald-900 hover:bg-emerald-100"
            }`}
          >
            +{type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div>
        <h4 className="text-md font-bold mb-2">Manage Rules</h4>
        <div className="flex gap-2 mb-3">
          <input
            placeholder="New Rule"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddRule();
              }
            }}
            className="flex-1 px-3 py-2 rounded border border-emerald-900 bg-emerald-50 text-emerald-950"
          />
          <button
            onClick={handleAddRule}
            className="py-2 px-3 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            <AddIcon />
          </button>
        </div>

        <div className="max-h-48 overflow-y-auto rounded bg-emerald-50 p-2 border border-emerald-900">
          {challengeRules.length > 0 ? (
            <ul className="space-y-2">
              {challengeRules.map((rule, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between text-emerald-900"
                >
                  <span>
                    {index + 1}. {rule}
                  </span>
                  <button
                    onClick={() => handleRemoveRule(index)}
                    className="p-1 rounded bg-red-200 hover:bg-red-300 transition"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 text-emerald-700">
              No rules yet. Add one above.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <details className="bg-emerald-50 p-2 rounded border border-emerald-900">
          <summary className="cursor-pointer flex items-center justify-between">
            <span className="font-semibold">Advanced Options</span>
            <ExpandMoreIcon />
          </summary>

          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold">University Challenge</span>
              <InfoOutlinedIcon className="text-emerald-700" />

              <label className="ml-auto flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={challenge?.is_academic}
                  disabled
                />
                <span className="text-sm">Enabled</span>
              </label>

              {userInfo?.role !== "teacher" && (
                <button
                  onClick={() => navigate && navigate("/account/academic")}
                  className="ml-2 py-1 px-3 border border-emerald-600 rounded text-emerald-600 hover:bg-emerald-100 transition"
                >
                  <SchoolIcon fontSize="small" /> Academic Account Settings
                </button>
              )}
            </div>

            {userInfo?.role === "teacher" && challenge?.is_academic && (
              <div className="pl-4 flex items-center gap-2">
                <span>Allow Non-Students</span>
                <InfoOutlinedIcon className="text-pink-400" />
                <label className="ml-auto">
                  <input
                    type="checkbox"
                    checked={challenge?.allow_non_students}
                    disabled
                  />
                </label>
              </div>
            )}

            <div>
              <fieldset disabled className="space-y-2">
                <legend className="font-semibold">Ranking system</legend>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ranking"
                      checked={challenge?.ranking_system === "voting"}
                      readOnly
                    />
                    <span>Voting</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ranking"
                      checked={challenge?.ranking_system === "manual"}
                      readOnly
                    />
                    <span>Manual Selection</span>
                  </label>
                </div>

                {challenge?.ranking_system === "manual" && (
                  <div className="pl-4 mt-2">
                    <div className="text-sm mb-2">Podium</div>
                    <div className="flex gap-2">
                      {[1, 3, 5, 10].map((count) => (
                        <label
                          key={count}
                          className="inline-flex items-center gap-2 text-sm"
                        >
                          <input type="radio" disabled /> Top {count}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </fieldset>
            </div>
          </div>
        </details>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSaveChallenge}
          className="py-2 px-4 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditChallengeTab;
