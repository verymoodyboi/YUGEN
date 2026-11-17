import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReportedAccounts, dismissReport, banUser, ReportedAccount } from "./services";

export function useReportedAccounts() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<ReportedAccount[]>({
    queryKey: ["reported_accounts"],
    queryFn: fetchReportedAccounts,
  });

  const dismissMutation = useMutation({
    mutationFn: dismissReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reported_accounts"] }),
  });

  const banMutation = useMutation({
    mutationFn: banUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reported_accounts"] }),
  });

  return {
    reportedAccounts: data || [],
    isLoading,
    isError,
    dismissReport: dismissMutation.mutateAsync,
    banUser: banMutation.mutateAsync,
    isDismissing: dismissMutation.isPending,
    isBanning: banMutation.isPending,
  };
}