import React, { useState } from "react";
import { useFilmReport } from "../hooks/useFilmReport";

interface ReportFormProps {
  film_id: string;
  onSubmitSuccess?: () => void;
  onClose?: () => void;
}

const ReportForm: React.FC<ReportFormProps> = ({
  film_id,
  onSubmitSuccess,
  onClose,
}) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [reportType, setReportType] = useState("");
  const [report, setReport] = useState("");
  const { handleSubmit, loading } = useFilmReport(() => {
    setIsSubmit(true);
    onSubmitSuccess?.();
  });

  const types = [
    "Intellectual Property Violation",
    "Spreading False Information",
    "Spam, Scam, or Fraud",
    "Inappropriate Content",
  ];

  if (isSubmit)
    return (
      <div className="flex flex-col gap-4 p-6 rounded-2xl border-4 border-emerald-950 bg-emerald-50 shadow-[6px_6px_0_#064e3b] animate-modal-in">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 text-emerald-950 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2l4 -4"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10z"
          />
        </svg>
        <h2 className="text-2xl text-emerald-950 mb-2">
          Report submitted successfully!
        </h2>
        <p className="text-emerald-950/80">
          Thank you for your feedback — our team will review it soon.
        </p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto font-freckle">
      <button
        onClick={(e) => {
          if (onClose) onClose();
        }}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-emerald-950 font-bold text-[23px] rounded-full bg-emerald-50 border-2 border-emerald-950 hover:bg-emerald-100 transition"
      >
        ×
      </button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(film_id, reportType, report);
        }}
        className="flex flex-col gap-4 p-6 rounded-2xl border-4 border-emerald-950 bg-emerald-50 shadow-[6px_6px_0_#064e3b]"
      >
        <h2 className="text-2xl font-bold text-center text-emerald-950 mb-2">
          Report this Film
        </h2>

        <label className="text-emerald-950 text-lg">Reason</label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          required
          className="p-2 rounded-lg border-2 border-emerald-950 bg-emerald-50 text-emerald-950 focus:ring-2 focus:ring-emerald-950"
        >
          <option value="">Select a reason</option>
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <label className="text-emerald-950 text-lg">Details</label>
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          placeholder="Please describe the issue"
          className="w-full min-h-[100px] p-3 border-2 border-emerald-950 rounded-lg bg-emerald-50 resize-y"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 py-2 rounded-lg border-2 border-emerald-950 bg-emerald-950 text-emerald-50 hover:scale-105 transition"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
