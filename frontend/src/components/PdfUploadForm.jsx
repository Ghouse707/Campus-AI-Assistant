import React, { useState, useRef } from "react";
import { uploadPdfKnowledge } from "../api/client";
import { FileUp, Upload, CheckCircle2, AlertCircle, FileText } from "lucide-react";

export default function PdfUploadForm({ onKnowledgeAdded }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Academics");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith(".pdf")) {
        setFeedback({ type: "error", message: "Please select a valid .pdf file." });
        return;
      }
      setFile(selected);
      if (!title) {
        // Auto-fill title from filename
        setTitle(selected.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
      setFeedback(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setFeedback({ type: "error", message: "Please choose a PDF and provide a title." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("category", category.trim() || "General");
    formData.append("file", file);

    try {
      const res = await uploadPdfKnowledge(formData);
      setFeedback({
        type: "success",
        message: `PDF parsed & indexed successfully! (${res.extracted_length || 0} characters extracted)`
      });
      setTitle("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onKnowledgeAdded) onKnowledgeAdded();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to parse and store PDF."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
          <FileUp className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">2. Upload PDF Document</h2>
          <p className="text-xs text-slate-400">Upload syllabus, circulars, or regulations. Text is automatically extracted and indexed for AI.</p>
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
        {/* File Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
            file
              ? "border-violet-500/50 bg-violet-950/20"
              : "border-slate-800 hover:border-slate-700 bg-slate-950/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
              <Upload className="h-5 w-5" />
            </div>
            {file ? (
              <div>
                <p className="text-xs font-semibold text-violet-300 flex items-center justify-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB • Click to choose a different PDF
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-medium text-slate-200">
                  Click to browse and upload college PDF
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF documents (.pdf)</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Document Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Merit Scholarship Scheme Notice"
              className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Academics, Scholarships, Rules"
              className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading || !file}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-lg shadow-violet-600/20 disabled:opacity-50 transition cursor-pointer"
          >
            <FileUp className="h-4 w-4" />
            <span>{loading ? "Extracting text from PDF..." : "Extract & Store Knowledge"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
