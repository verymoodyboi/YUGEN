import React, { useState } from "react";
import { useSupportTickets } from "../../features/admin/supportTickets/useSupportTickets";
import { FiLifeBuoy, FiSend, FiCheckCircle } from "react-icons/fi";
import Loading from "../../components/loading_kickflip";

const SupportTicketsPage: React.FC = () => {
  const { tickets, isLoading, isError, sendReply, isReplying } =
    useSupportTickets();
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const handleSend = (id: string) => {
    if (!draft.trim()) return;
    sendReply(id, draft);
    setDraft("");
    setOpenReplyId(null);
  };

  return (
    <div className="min-h-screen text-emerald-950 font-freckle p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FiLifeBuoy /> Support Tickets
        </h1>
      </div>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <p className="text-red-600">Failed to load support tickets.</p>
      ) : tickets.length === 0 ? (
        <p className="text-emerald-900">No support tickets at the moment :)</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket: any) => {
            const user = ticket.users;
            const isOpen = openReplyId === ticket.id;

            return (
              <div
                key={ticket.id}
                className="bg-emerald-100 border-4 border-emerald-950 rounded-xl p-4 flex flex-col justify-between hover:-translate-y-[2px] transition-transform"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      {user?.username || "Unknown User"}
                    </h2>
                    {ticket.reviewed && (
                      <span className="flex items-center gap-1 text-xs text-emerald-700">
                        <FiCheckCircle /> Replied
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-2 opacity-70">
                    {user?.f_name && user?.l_name
                      ? `${user.f_name} ${user.l_name}`
                      : "Name unavailable"}
                  </p>
                  <p className="text-xs opacity-70">{user?.email}</p>
                  <p className="text-xs opacity-70">
                    Submitted: {new Date(ticket.created_at).toLocaleString()}
                  </p>
                  <p className="text-xs mt-2 opacity-70">
                    Type: {ticket.report_type || "Unknown"}
                  </p>
                  <p className="text-xs mt-2 opacity-70">
                    Details: {ticket.report}
                  </p>
                  {ticket.admin_reply && (
                    <p className="text-xs mt-2 opacity-70 italic">
                      Your reply: {ticket.admin_reply}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  {isOpen ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Write a reply..."
                        rows={3}
                        className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 p-2 text-sm focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSend(ticket.id)}
                          disabled={isReplying}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border-2 border-emerald-950 bg-emerald-900 text-emerald-50 hover:scale-[1.03] transition disabled:opacity-50"
                        >
                          <FiSend /> {isReplying ? "Sending..." : "Send"}
                        </button>
                        <button
                          onClick={() => {
                            setOpenReplyId(null);
                            setDraft("");
                          }}
                          className="px-3 py-2 rounded-full border-2 border-emerald-950 bg-emerald-50 hover:scale-[1.03] transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setOpenReplyId(ticket.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full border-2 border-emerald-950 bg-emerald-900 text-emerald-50 hover:scale-[1.03] transition"
                    >
                      <FiSend /> Reply
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupportTicketsPage;
