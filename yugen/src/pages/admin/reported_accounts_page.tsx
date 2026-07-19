import React from "react";
import { useReportedAccounts } from "../../features/admin/reported_accounts/useReportedAccounts";
import { FiAlertCircle, FiUserX, FiCheckCircle } from "react-icons/fi";
import tempAvatar from "../../YugenAssits/Cover_Placeholder.png";
import Loading from "../../components/loading_kickflip";
import { useNavigate } from "react-router-dom";

const ReportedAccountsPage: React.FC = () => {
  const {
    reportedAccounts,
    isLoading,
    isError,
    dismissReport,
    banUser,
    isDismissing,
    isBanning,
  } = useReportedAccounts();
  const navigate = useNavigate();
  return (
    <>
      <div className="min-h-screen  text-emerald-950 font-freckle p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiAlertCircle /> Reported Accounts
          </h1>
        </div>

        {isLoading ? (
          <Loading />
        ) : isError ? (
          <p className="text-red-600">Failed to load reported accounts.</p>
        ) : reportedAccounts.length === 0 ? (
          <p className="text-emerald-900">
            No reported accounts at the moment :)
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportedAccounts.map((item) => {
              const user = item.reported_user;

              return (
                <div
                  key={item.id}
                  className="bg-emerald-100 border-4 border-emerald-950 rounded-xl p-4 flex flex-col justify-between hover:-translate-y-[2px] transition-transform"
                >
                  <div>
                    <img
                      src={
                        user?.pfp_path
                          ? `https://pfps.try-yugen.com/${user?.pfp_path}`
                          : tempAvatar
                      }
                      alt={user?.username || "User Avatar"}
                      className="w-150 h-100 object-cover rounded-50 border-2 border-emerald-950"
                      onClick={() => {
                        navigate(
                          `/@?username=${encodeURIComponent(user?.username || "")}`,
                        );
                      }}
                    />
                    <h2 className="text-xl font-semibold mt-3">
                      {user?.username || "Unknown User"}
                    </h2>
                    <p className="text-xs mt-2 opacity-70">
                      {user?.f_name && user?.l_name
                        ? `${user.f_name} ${user.l_name}`
                        : "Name unavailable"}
                    </p>
                    <p className="text-xs opacity-70">
                      Reported by @{item.reporter?.username || "Unknown"}
                    </p>
                    <p className="text-xs opacity-70">
                      Reported: {new Date(item.reported_at).toLocaleString()}
                    </p>
                    <p className="text-xs mt-2 opacity-70">
                      Reason: {item.reason || "Unknown"}
                    </p>
                    {item.report && (
                      <p className="text-xs mt-2 opacity-70">
                        Details: {item.report}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => dismissReport(item.id)}
                      disabled={isDismissing}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border-2 border-emerald-950 bg-emerald-900 text-emerald-50 hover:scale-[1.03] transition disabled:opacity-50"
                    >
                      <FiCheckCircle />{" "}
                      {isDismissing ? "Dismissing..." : "Dismiss"}
                    </button>

                    <button
                      onClick={() => banUser(item.reported)}
                      disabled={isBanning}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border-2 border-red-900 bg-red-900 text-emerald-50 hover:scale-[1.03] transition disabled:opacity-50"
                    >
                      <FiUserX /> {isBanning ? "Banning..." : "Ban"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ReportedAccountsPage;
