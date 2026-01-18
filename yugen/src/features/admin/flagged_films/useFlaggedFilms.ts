import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFlaggedFilms, recoverFilm, deleteFilm, FlaggedFilm } from "./services";

export function useFlaggedFilms() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<FlaggedFilm[]>({
    queryKey: ["flagged_films"],
    queryFn: fetchFlaggedFilms,
  });

  const recoverMutation = useMutation({
    mutationFn: recoverFilm,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flagged_films"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFilm,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flagged_films"] }),
  });

  return {
    flaggedFilms: data || [],
    isLoading,
    isError,
    recoverFilm: recoverMutation.mutateAsync,
    deleteFilm: deleteMutation.mutateAsync,
    isRecovering: recoverMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
