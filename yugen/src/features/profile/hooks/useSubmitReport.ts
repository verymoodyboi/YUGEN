import { useMutation } from "@tanstack/react-query";
import { submitReport, SubmitReportPayload } from "../reportService";

export function useSubmitReport() {
  const mutation = useMutation({
    mutationFn: (payload: SubmitReportPayload) => submitReport(payload),
  });

  return {
    submitReport: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
