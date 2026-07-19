import React, { useState, useRef, useEffect } from "react";
import { FiFlag } from "react-icons/fi";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useSubmitReport } from "../hooks/useSubmitReport";
import { REPORT_REASONS } from "../reportService";
import { useAuth } from "../../../contexts/AuthContext";

interface ReportButtonProps {
  reportedUserId: string;
  label?: string;
}

const ReportButton: React.FC<ReportButtonProps> = ({
  reportedUserId,
  label = "Report",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [isSubmit, setIsSubmit] = useState(false);
  const { userInfo } = useAuth();
  const { submitReport, isSubmitting } = useSubmitReport();

  const formRef = useRef<HTMLDivElement>(null);

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setAnimate(false);
      setTimeout(() => setAnimate(true), 10);
    }
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
    setSelectedReason("");
    setMessage("");
    setValidationError("");
    setIsSubmit(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setValidationError("Please select a reason.");
      return;
    }
    setValidationError("");

    try {
      await submitReport({
        reported_by: userInfo.auth_id,
        reported: reportedUserId,
        reason: selectedReason,
        report: message,
      });
      setIsSubmit(true);
    } catch {
      setValidationError("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded-full border-2 border-emerald-950 bg-emerald-50 text-emerald-950 hover:scale-[1.03] transition"
      >
        <FiFlag />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          {isSubmit ? (
            <div
              ref={formRef}
              className={`flex flex-col items-center justify-center text-center p-6 rounded-2xl border-4 
              border-emerald-950 bg-emerald-50 shadow-[6px_6px_0_#064e3b] font-freckle 
              transition-all duration-300 ease-out 
              ${animate ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
            >
              <CheckCircleOutlineIcon
                sx={{ fontSize: 100, color: "#064e3b" }}
              />
              <h2 className="text-3xl mt-4 mb-2">Report submitted!</h2>
              <p className="text-lg">
                Thank you for helping keep the community safe — our team will
                review the report.
              </p>
            </div>
          ) : (
            <div
              ref={formRef}
              className={`transition-all duration-300 ease-out 
              ${animate ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
            >
              <form
                onSubmit={handleFormSubmit}
                className="relative flex flex-col gap-4 p-6 rounded-2xl border-4 border-emerald-950 bg-emerald-50 shadow-[6px_6px_0_#064e3b] font-freckle w-full max-w-md"
              >
                <h2 className="text-3xl font-bold mb-4 text-center">
                  Report Account
                </h2>

                <label className="block text-lg mb-1">Reason</label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  required
                  className="w-full border-2 border-emerald-950 rounded-lg bg-emerald-50 px-3 py-2 focus:ring-2 focus:ring-emerald-950"
                >
                  <option value="">Select a reason...</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>

                <label className="block text-lg mb-1">Details</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more about what happened..."
                  rows={4}
                  className="w-full border-2 border-emerald-950 rounded-lg bg-emerald-50 px-3 py-2 resize-none focus:ring-2 focus:ring-emerald-950"
                />

                {validationError && (
                  <p className="text-red-700 text-sm">{validationError}</p>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="flex-1 border-2 border-emerald-950 text-emerald-950 rounded-full py-2 font-semibold hover:scale-105 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-emerald-950 text-emerald-50 rounded-full py-2 font-semibold hover:scale-105 transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ReportButton;
