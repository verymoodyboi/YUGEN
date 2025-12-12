// src/pages/SubscriptionsPage.tsx
import * as React from "react";
import { useAuth } from "../contexts/AuthContext";
import AccountCard from "../components/AccountCard";
import AppLayout from "../layouts/layout-main";
import { useSubs } from "../features/subscriptions/hooks/useSubs";
import Loading from "../components/loading_kickflip";

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
    <>
      <div className="flex flex-col flex-grow overflow-y-auto space-y-6 pr-2">
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
          <div className="flex flex-wrap gap-3 justify-center">
            {subscriptions.map((subItem, index) => (
              <div key={index} className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5">
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
