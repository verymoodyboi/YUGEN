// src/pages/PokesPage.tsx
import React, { useEffect, useState } from "react";
import { usePokes } from "../features/pokes/usePokes";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/loading_kickflip";
import tempPFP from "../YugenAssits/Avatar_Placeholder.png";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Eye,
  Send,
  Sparkles,
  XCircle,
  Users,
  GraduationCap,
  Inbox,
  Mail,
  UserPlus,
  Handshake,
} from "lucide-react";

const PokesPage: React.FC = () => {
  const { getAccessToken } = useAuth();
  const navigate = useNavigate();
  const {
    sent,
    received,
    loading,
    processing,
    loadPokes,
    handleAcceptPoke,
    handleDeletePoke,
    handleRejectPoke,
  } = usePokes(getAccessToken);

  const [activeTab, setActiveTab] = useState<
    "all" | "sent" | "received" | "accepted"
  >("all");

  useEffect(() => {
    loadPokes().catch(console.error);
  }, [loadPokes]);

  const filteredPokes = () => {
    switch (activeTab) {
      case "sent":
        return sent.map((p) => ({ ...p, type: "sent" as const }));
      case "received":
        return received.map((p) => ({ ...p, type: "received" as const }));
      case "accepted":
        return [
          ...sent
            .filter((p) => p.accepted)
            .map((p) => ({ ...p, type: "sent" as const })),
          ...received
            .filter((p) => p.accepted)
            .map((p) => ({ ...p, type: "received" as const })),
        ];
      default:
        return [
          ...sent.map((p) => ({ ...p, type: "sent" as const })),
          ...received.map((p) => ({ ...p, type: "received" as const })),
        ];
    }
  };
  const pokesToShow = filteredPokes();
  const getPokeState = (poke: any, type: "sent" | "received") => {
    if (poke.accepted) {
      return {
        label: "Matched",
        icon: CheckCircle,
        card: "bg-emerald-100 border-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.25)]",
        badge: "bg-emerald-700 text-white",
      };
    }

    if (poke.is_rejected) {
      return {
        label: "Declined",
        icon: XCircle,
        card: "bg-red-50 border-red-600",
        badge: "bg-red-600 text-white",
      };
    }

    if (type === "sent") {
      return {
        label: "Sent",
        icon: Send,
        card: "bg-emerald-50 border-emerald-300",
        badge: "bg-emerald-600 text-white",
      };
    }

    if (type === "received") {
      if (!poke.seen) {
        return {
          label: "New",
          icon: Sparkles,
          card: "bg-yellow-50 border-yellow-400",
          badge: "bg-yellow-500 text-white",
        };
      }

      return {
        label: "",
        icon: Eye,
        card: "bg-emerald-50 border-emerald-400",
        badge: "",
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-emerald-950 font-freckle">
        <Loading />
      </div>
    );
  }
  const EmptyState = ({ tab }: { tab: string }) => {
    let Icon = Inbox;
    let title = "Nothing here yet";
    let subtitle = "Start by poking someone.";

    if (tab === "sent") {
      Icon = Send;
      title = "No pokes sent";
      subtitle = "Find someone interesting and send a poke.";
    }

    if (tab === "received") {
      Icon = Mail;
      title = "No pokes received";
      subtitle = "When someone pokes you, it’ll show up here.";
    }

    if (tab === "accepted") {
      Icon = Handshake;
      title = "No matches yet";
      subtitle = "Accept a poke to start collaborating.";
    }

    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-emerald-900 opacity-80">
        <Icon size={72} className="mb-4 text-emerald-700 opacity-60" />

        <div className="text-2xl font-bold mb-2">{title}</div>

        <div className="text-sm opacity-70">{subtitle}</div>
      </div>
    );
  };
  return (
    <div className="min-h-screen p-4 font-freckle text-emerald-950">
      <h1 className="text-4xl font-bold border-b-4 border-emerald-950 pb-2 mb-4">
        Pokes
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        {(["all", "sent", "received", "accepted"] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-md font-bold transition-transform hover:-translate-y-[1px] ${
              activeTab === tab
                ? "bg-emerald-950 text-emerald-50"
                : "bg-emerald-50 text-emerald-950 border-2 border-emerald-950"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {pokesToShow.length == 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          pokesToShow.map((poke: any) => {
            const type = poke.type;
            const user = type === "sent" ? poke.receiver : poke.sender;

            const sameRegion =
              poke.sender?.region &&
              poke.receiver?.region &&
              poke.sender.region === poke.receiver.region;

            const sameUniversity =
              poke.sender?.university &&
              poke.receiver?.university &&
              poke.sender.university === poke.receiver.university;

            const isMatched = sameRegion || sameUniversity;

            const state = getPokeState(poke, type);
            const Icon = state.icon;

            return (
              <div
                key={poke.id}
                className={`p-4 border-2 rounded-lg transition-all duration-200
              hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#064e3b]
              ${state.card}
              ${isMatched ? "ring-2 ring-emerald-500" : ""}`}
              >
                {/* Header */}
                <div
                  className="flex items-center gap-3 mb-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/@?username=${encodeURIComponent(user?.username)}`,
                    );
                  }}
                >
                  <img
                    src={
                      user?.pfp_path
                        ? `https://pfps.try-yugen.com/${user.pfp_path}?t=${Date.now()}`
                        : tempPFP
                    }
                    alt={user?.username || "user"}
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src !== tempPFP) img.src = tempPFP;
                    }}
                    className="w-10 h-10 rounded-full border border-emerald-950"
                  />

                  <span className="font-bold">@{user?.username}</span>

                  <span className="ml-auto text-sm italic opacity-70">
                    {new Date(poke.created_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Status Row */}
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" />

                  {state.label && (
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-bold ${state.badge}`}
                    >
                      {state.label}
                    </span>
                  )}

                  <span className="text-xs opacity-70">
                    {type === "sent"
                      ? `You poked @${user?.username}`
                      : `@${user?.username} poked you`}
                  </span>
                </div>

                {/* Collaboration Message */}
                {isMatched && (
                  <div className="text-sm font-semibold text-emerald-800 mb-2 flex items-start gap-2">
                    {sameUniversity ? (
                      <>
                        <GraduationCap size={16} className="mt-[2px]" />
                        <span>
                          You and <b>@{user?.username}</b> go to{" "}
                          <b>{user?.university}</b>. Reach out and create
                          something togeather.
                        </span>
                      </>
                    ) : (
                      <>
                        <Users size={16} className="mt-[2px]" />
                        <span>
                          You and <b>@{user?.username}</b> are both from{" "}
                          <b>{user?.region}</b>. Contact and collaborate with a
                          local fellow artist!
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                  {type === "received" &&
                    !poke.accepted &&
                    !poke.is_rejected && (
                      <>
                        <button
                          type="button"
                          disabled={processing}
                          onClick={() => handleAcceptPoke(poke.id)}
                          className="px-3 py-1 rounded-full bg-emerald-700 text-white hover:scale-105"
                        >
                          Accept
                        </button>

                        <button
                          type="button"
                          disabled={processing}
                          onClick={() => handleRejectPoke(poke.id)}
                          className="px-3 py-1 rounded-full border border-red-600 text-red-600 hover:scale-105"
                        >
                          Reject
                        </button>
                      </>
                    )}

                  {type === "sent" && !poke.accepted && !poke.is_rejected && (
                    <button
                      type="button"
                      disabled={processing}
                      onClick={() => handleDeletePoke(poke.id)}
                      className="px-3 py-1 rounded-full border border-red-600 text-red-600 hover:scale-105"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PokesPage;
