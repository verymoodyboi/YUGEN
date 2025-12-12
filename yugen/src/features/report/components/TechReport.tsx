import React, { useState, useRef, useEffect } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useTechnicalReport } from "../hooks/useTechReport";

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

  const formRef = useRef<HTMLDivElement>(null);

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        onSubmitSuccess?.();
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onSubmitSuccess]);

  if (isSubmit)
    return (
      <div
        ref={formRef}
        className={`flex flex-col items-center justify-center text-center p-6 rounded-2xl border-4 
        border-emerald-950 bg-emerald-50 shadow-[6px_6px_0_#064e3b] font-freckle 
        transition-all duration-300 ease-out 
        ${animate ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 100, color: "#064e3b" }} />
        <h2 className="text-3xl mt-4 mb-2">Technical report submitted!</h2>
        <p className="text-lg">
          Thank you for your feedback — our technical team will review the
          issue.
        </p>
      </div>
    );

  return (
    <div
      ref={formRef}
      className={`transition-all duration-300 ease-out 
      ${animate ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(reportType, report);
        }}
        className="flex flex-col gap-4 p-6 rounded-2xl border-4 border-emerald-950 bg-emerald-50 shadow-[6px_6px_0_#064e3b]"
      >
        <h2 className="text-3xl font-bold mb-4 text-center">
          Report a Technical Issue
        </h2>

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
    </div>
  );
};

export default TechnicalReportForm;
