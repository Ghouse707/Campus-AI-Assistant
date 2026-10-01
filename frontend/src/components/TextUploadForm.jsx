import React, { useState } from "react";
import { addTextKnowledge } from "../api/client";
import { FileText, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function TextUploadForm({ onKnowledgeAdded }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Exams");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFeedback({ type: "error", message: "Please enter both title and content." });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      await addTextKnowledge({
        title: title.trim(),
        category: category.trim() || "General",
        content: content.trim(),
      });
      setFeedback({
        type: "success",
        message: "Text knowledge added and indexed for AI search!",
      });
      setTitle("");
      setContent("");
      if (onKnowledgeAdded) onKnowledgeAdded();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to save text content.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">1. Add Text Knowledge</h2>
          <p className="text-xs text-slate-400">Directly enter notices, announcements, rules, or circulars for AI retrieval.</p>
        </div>
      </div>

      {feedback && (
        <div
          className={`mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Internal Exam Schedule July 2026"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Exams, Library, Hostel"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Content / Information</label>
          <textarea
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g. Internal exam will be conducted on 12 July at 9:30 AM in Main Hall B. Reporting time is 9:15 AM."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition leading-relaxed resize-y"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Saving..." : "Save Knowledge"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
