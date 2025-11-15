import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useTechnicalReport } from "../hooks/useTechReport";
import "react-toastify/dist/ReactToastify.css";

interface Props {
  onSubmitSuccess?: () => void;
}

const TechnicalReportForm: React.FC<Props> = ({ onSubmitSuccess }) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [reportType, setReportType] = useState("");
  const [report, setReport] = useState("");
  const { handleSubmit, loading } = useTechnicalReport(() => {
    setIsSubmit(true);
    onSubmitSuccess?.();
  });

  const types = [
    "Buffering or playback issues",
    "Video quality problems",
    "Audio not syncing or missing",
    "Subtitles not working",
    "App/website freezing",
    "Login issues",
    "Other technical issue",
  ];

  if (isSubmit)
    return (
      <div className="flex flex-col items-center justify-center text-center bg-emerald-50 text-emerald-950 p-6 rounded-3xl border-4 border-emerald-950 shadow-2xl font-freckle max-w-md mx-auto">
        <CheckCircleOutlineIcon sx={{ fontSize: 100, color: "#064e3b" }} />
        <h2 className="text-3xl mt-4 mb-2">Technical report submitted!</h2>
        <p className="text-lg">
          Thank you for your feedback — our technical team will review the
          issue.
        </p>
        <ToastContainer position="top-left" theme="dark" />
      </div>
    );

  return (
    <div className="bg-emerald-50 text-emerald-950 font-freckle p-6 rounded-3xl border-4 border-emerald-950 shadow-2xl max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-center">
        Report a Technical Issue
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(reportType, report);
        }}
        className="flex flex-col gap-4"
      >
        <label className="block text-lg mb-1">Issue Type</label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          required
          className="w-full border-2 border-emerald-950 rounded-lg bg-emerald-50 px-3 py-2 focus:ring-2 focus:ring-emerald-950"
        >
          <option value="">Select issue type...</option>
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <label className="block text-lg mb-1">Details</label>
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          placeholder="Describe the issue..."
          rows={4}
          className="w-full border-2 border-emerald-950 rounded-lg bg-emerald-50 px-3 py-2 resize-none focus:ring-2 focus:ring-emerald-950"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-3 bg-emerald-950 text-emerald-50 rounded-full py-2 font-semibold hover:scale-105 transition"
        >
          {loading ? "Submitting..." : "Submit Technical Report"}
        </button>
      </form>

      <ToastContainer position="top-left" autoClose={4000} theme="dark" />
    </div>
  );
};

export default TechnicalReportForm;
