import { useState } from "react";
import { toast } from "react-toastify";
import { submitTechnicalReport } from "../services";
import { useAuth } from "../../../contexts/AuthContext";

export function useTechnicalReport(onSuccess?: () => void) {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (reportType: string, report: string) => {
    if (!report.trim()) {
      toast.warn("Please describe the technical issue!");
      return;
    }

    try {
      setLoading(true);
      await submitTechnicalReport({
        auth_id: userInfo?.auth_id,
        report,
        reportType,
      });
      toast.success("Technical report submitted!");
      onSuccess?.();
    } catch (err: any) {
      console.error("Error submitting technical report:", err);
      toast.error("Failed to submit technical report");
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit, loading };
}
