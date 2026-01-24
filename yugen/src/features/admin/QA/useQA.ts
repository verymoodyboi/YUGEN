import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPendingUploads,
  acceptUpload,
  rejectUpload,
  PendingUpload,
} from "./services";

export function usePendingUploads() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<PendingUpload[]>({
    queryKey: ["pending_uploads"],
    queryFn: fetchPendingUploads,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptUpload,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["pending_uploads"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectUpload,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["pending_uploads"] }),
  });

  return {
    pendingUploads: data || [],
    isLoading,
    isError,
    acceptUpload: acceptMutation.mutateAsync,
    rejectUpload: rejectMutation.mutateAsync,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
