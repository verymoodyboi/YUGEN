import React, { useState, useRef, useEffect } from "react";
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
  const { submitReply } = useReply(onSubmitSuccess);

  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        onSubmitSuccess?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onSubmitSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    await submitReply(comment_id, comment);
    setIsSubmitting(false);
    setComment("");
  };

  return (
    <div ref={formRef} className="w-full max-w-xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-6 rounded-2xl border-4 border-emerald-950 bg-emerald-50 shadow-[6px_6px_0_#064e3b]"
      >
        <p className="font-freckle text-emerald-950 text-lg">
          Reply to <span className="font-bold">@{commentor}</span>
        </p>

        <textarea
          name="Comment"
          placeholder={`@${commentor} `}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full min-h-[80px] p-2 text-emerald-950 border-2 border-emerald-950 rounded-lg bg-emerald-50 font-freckle focus:outline-none focus:ring-2 focus:ring-emerald-950 resize-y"
        />

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
    </div>
  );
};

export default ReplyForm;
