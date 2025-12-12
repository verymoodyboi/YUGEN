import { useState } from "react";
import { submitFilmReport } from "../services";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../components/toaster";

export function useFilmReport(onSuccess?: () => void) {
  const toast = useToast()
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    film_id: string,
    reportType: string,
    report: string
  ) => {
    if (!report.trim()) {
      toast.warn("Please enter a report message!");
      return;
    }

    try {
      setLoading(true);
      await submitFilmReport({
        auth_id: userInfo?.auth_id,
        report,
        reportType,
        film_id,
      });
      toast.success("Report submitted!");
      onSuccess?.();
    } catch (err: any) {
      console.error("Error submitting film report:", err);
      toast.error("Failed to submit film report");
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit, loading };
}
