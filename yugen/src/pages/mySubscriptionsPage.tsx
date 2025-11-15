// src/pages/SubscriptionsPage.tsx
import * as React from "react";
import { useAuth } from "../contexts/AuthContext";
import AccountCard from "../components/AccountCard";
import AppLayout from "../layouts/layout-main";
import { useSubs } from "../features/subscriptions/hooks/useSubs";

const SubscriptionsPage: React.FC = () => {
  const { getAccessToken, userInfo } = useAuth();
  const {
    subscriptions,
    loading,
    loadSubscriptions,
    handleSubscribe,
    handleUnsubscribe,
  } = useSubs(getAccessToken);

  React.useEffect(() => {
    if (userInfo?.auth_id) loadSubscriptions();
  }, [userInfo?.auth_id, loadSubscriptions]);

  return (
    <AppLayout>
      <div className="flex flex-col flex-grow overflow-y-auto space-y-6 pr-2">
        <h2 className="font-freckle text-2xl text-emerald-950 text-left mb-4">
          Subscriptions
        </h2>

        {loading ? (
          <p className="text-emerald-950">Loading…</p>
        ) : subscriptions.length === 0 ? (
          <p className="text-emerald-950">No subscriptions yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center">
            {subscriptions.map((subItem, index) => (
              <div key={index} className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5">
                <AccountCard account={subItem.sub} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SubscriptionsPage;
