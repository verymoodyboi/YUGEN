// src/pages/SubscriptionsPage.tsx
import * as React from "react";
import { useAuth } from "../contexts/AuthContext";
import AccountCard from "../components/AccountCard";
import { useSubs } from "../features/subscriptions/hooks/useSubs";
import Loading from "../components/loading_kickflip";

const SubscriptionsPage: React.FC = () => {
  const { getAccessToken, userInfo } = useAuth();
  const { subscriptions, loading, loadSubscriptions } = useSubs(getAccessToken);

  React.useEffect(() => {
    if (userInfo?.auth_id) loadSubscriptions();
  }, [userInfo?.auth_id, loadSubscriptions]);

  return (
    <>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <h1 className="text-4xl font-bold border-b-4 border-emerald-950  pb-2">
            Subscrptions
          </h1>
          <p className="text-sm text-emerald-900/70  mt-2 sm:mt-0">
            Your favourite filmmakers
          </p>
        </div>

        {loading ? (
          <Loading />
        ) : subscriptions.length === 0 ? (
          <p className="text-emerald-950">No subscriptions yet.</p>
        ) : (
          // Wrapping flex row, centered. Cards have a fixed width so the
          // number per row adapts to the screen, and every row (including
          // a partial last one) is centered. Mobile: exactly 2 per row.
          <div className="flex flex-wrap justify-center gap-3">
            {subscriptions.map((subItem, index) => (
              <div
                key={index}
                className="min-w-0 flex justify-center w-[calc(50%-0.375rem)] sm:w-44"
              >
                <AccountCard account={subItem.sub} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SubscriptionsPage;
