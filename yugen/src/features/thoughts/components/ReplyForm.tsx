import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useReply } from "../hooks/useReply";

interface TargetReply {
  comment_id: number;
  commentor: string;
  onSubmitSuccess?: () => void;
}

const ReplyForm: React.FC<TargetReply> = ({
  comment_id,
  commentor,
  onSubmitSuccess,
}) => {
  // Get only the function we need
  const { submitReply } = useReply(onSubmitSuccess);

  // Local state for textarea
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    await submitReply(comment_id, comment);
    setIsSubmitting(false);
    setComment(""); // reset form
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 p-4 rounded-xl border-2 border-emerald-950 bg-emerald-50 shadow-md"
      >
        <p className="font-freckle text-emerald-950 text-lg">
          Reply to <span className="font-bold">@{commentor}</span>
        </p>

        {/* Textarea */}
        <textarea
          name="Comment"
          placeholder={`@${commentor} `}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full min-h-[80px] p-2 text-emerald-950 border-2 border-emerald-950 rounded-lg 
                     bg-emerald-50 font-freckle focus:outline-none focus:ring-2 focus:ring-emerald-950
                     resize-y"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-lg border-2 border-emerald-950 font-freckle transition-transform duration-200 ease-in-out ${
            isSubmitting
              ? "bg-gray-400 text-gray-100 cursor-not-allowed"
              : "bg-emerald-950 text-emerald-50 hover:scale-105"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default ReplyForm;
