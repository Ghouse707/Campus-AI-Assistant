import React, { useState, useRef } from "react";
import { uploadImageKnowledge } from "../api/client";
import { Image as ImageIcon, ScanText, Upload, CheckCircle2, AlertCircle } from "lucide-react";

export default function ImageUploadForm({ onKnowledgeAdded }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Notices");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/bmp"];
      if (!validTypes.includes(selected.type) && !selected.name.match(/\.(png|jpe?g|webp|bmp)$/i)) {
        setFeedback({ type: "error", message: "Please select an image file (PNG, JPG, WEBP)." });
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
      setFeedback(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setFeedback({ type: "error", message: "Please choose an image notice and provide a title." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("category", category.trim() || "General");
    formData.append("file", file);

    try {
      const res = await uploadImageKnowledge(formData);
      setFeedback({
        type: "success",
        message: `Image OCR processed & indexed successfully! (${res.extracted_length || 0} characters extracted)`
      });
      setTitle("");
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onKnowledgeAdded) onKnowledgeAdded();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to process image OCR."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <ImageIcon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">3. Upload Notice Image</h2>
          <p className="text-xs text-slate-400">Upload circular photos or notice board snapshots. OCR extracts the text for AI queries.</p>
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
        {/* Image Dropzone & Preview */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
            file
              ? "border-amber-500/50 bg-amber-950/20"
              : "border-slate-800 hover:border-slate-700 bg-slate-950/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {preview ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={preview}
                alt="Upload preview"
                className="max-h-48 rounded-xl object-contain border border-slate-700 bg-slate-950 p-1"
              />
              <p className="text-xs text-amber-300 font-semibold">{file.name}</p>
              <p className="text-[11px] text-slate-400">
                {(file.size / 1024).toFixed(1)} KB • Click to choose a different image
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-200">
                  Click to select college notice photo or screenshot
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Supports PNG, JPG, JPEG, WEBP</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Notice Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sports Meet Notice Board Photo"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Sports, Events, Facilities"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading || !file}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-lg shadow-amber-600/20 disabled:opacity-50 transition cursor-pointer"
          >
            <ScanText className="h-4 w-4" />
            <span>{loading ? "Running OCR on Image..." : "Run OCR & Store Knowledge"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
