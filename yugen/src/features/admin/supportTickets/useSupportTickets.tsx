import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSupportTickets, replySupportTicket } from "./services";
import { useToast } from "../../../components/toaster";

export function useSupportTickets() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    data: tickets,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: fetchSupportTickets,
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      replySupportTicket(id, message),
    onSuccess: () => {
      toast.success("Reply sent!");
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
    onError: () => {
      toast.error("Failed to send reply");
    },
  });

  return {
    tickets: tickets ?? [],
    isLoading,
    isError,
    sendReply: (id: string, message: string) =>
      replyMutation.mutate({ id, message }),
    isReplying: replyMutation.isPending,
  };
}
