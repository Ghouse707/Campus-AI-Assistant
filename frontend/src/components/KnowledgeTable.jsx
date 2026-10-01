import React, { useState } from "react";
import { 
  Trash2, 
  FileText, 
  FileUp, 
  Image as ImageIcon, 
  Calendar, 
  Tag, 
  Eye, 
  X,
  AlertTriangle 
} from "lucide-react";

export default function KnowledgeTable({ 
  knowledgeList, 
  onDelete, 
  activeFilter, 
  onFilterChange 
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const getSourceBadge = (type) => {
    switch (type) {
      case "text":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="h-3 w-3" />
            TEXT
          </span>
        );
      case "pdf":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <FileUp className="h-3 w-3" />
            PDF
          </span>
        );
      case "image":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ImageIcon className="h-3 w-3" />
            IMAGE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-400">
            {type}
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recent";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const handleDeleteClick = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header & Filter Bar */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Stored College Knowledge
          </h3>
          <p className="text-xs text-slate-400">
            {knowledgeList.length} verified knowledge entries available for AI RAG retrieval
          </p>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          {["all", "text", "pdf", "image"].map((tab) => (
            <button
              key={tab}
              onClick={() => onFilterChange(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer capitalize ${
                activeFilter === tab
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab === "all" ? "All Types" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {knowledgeList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No knowledge entries found for this filter. Use the form above to add knowledge.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {knowledgeList.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-850/50 transition group"
                >
                  {/* Title & Preview button */}
                  <td className="py-3.5 px-4 font-medium text-slate-200 max-w-xs truncate">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{item.title}</span>
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="text-slate-500 hover:text-indigo-400 transition flex-shrink-0"
                        title="View stored content"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getSourceBadge(item.source_type)}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-slate-300">
                      <Tag className="h-3 w-3 text-slate-500" />
                      {item.category}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      {formatDate(item.created_at)}
                    </span>
                  </td>

                  {/* Delete button */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteClick(item.id, item.title)}
                      disabled={deletingId === item.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer disabled:opacity-50"
                      title="Delete knowledge item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{deletingId === item.id ? "Deleting..." : "Delete"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Content Inspection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  {getSourceBadge(selectedItem.source_type)}
                  <h4 className="text-base font-bold text-white tracking-tight">{selectedItem.title}</h4>
                </div>
                <p className="text-xs text-slate-400 mt-1">Category: {selectedItem.category}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Stored Content (Searchable by AI)
              </label>
              <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-mono">
                {selectedItem.content}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
