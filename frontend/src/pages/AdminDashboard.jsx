import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getKnowledgeList, deleteKnowledgeItem } from "../api/client";
import TextUploadForm from "../components/TextUploadForm";
import PdfUploadForm from "../components/PdfUploadForm";
import ImageUploadForm from "../components/ImageUploadForm";
import KnowledgeTable from "../components/KnowledgeTable";
import { 
  FileText, 
  FileUp, 
  Image as ImageIcon, 
  Sparkles, 
  LogOut, 
  MessageSquare, 
  Database,
  Layers,
  Shield
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("text"); // 'text' | 'pdf' | 'image'
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [tableFilter, setTableFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchKnowledge = async () => {
    try {
      const res = await getKnowledgeList();
      setKnowledgeList(res.knowledge || []);
    } catch (err) {
      console.error("Error fetching knowledge", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteKnowledgeItem(id);
      setKnowledgeList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to delete item: " + err.message);
    }
  };

  const filteredKnowledge = knowledgeList.filter((item) => {
    if (tableFilter === "all") return true;
    return item.source_type === tableFilter;
  });

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar matching exact structure:
          Campus AI
          ├── Text
          ├── PDF
          └── Images
      */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 flex-shrink-0">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">
                Campus AI
              </h1>
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
              Provide AI Knowledge
            </p>

            {/* Text Tab */}
            <button
              onClick={() => {
                setActiveTab("text");
                setTableFilter("all");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "text"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Text</span>
            </button>

            {/* PDF Tab */}
            <button
              onClick={() => {
                setActiveTab("pdf");
                setTableFilter("all");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "pdf"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              <FileUp className="h-4 w-4" />
              <span>PDF</span>
            </button>

            {/* Images Tab */}
            <button
              onClick={() => {
                setActiveTab("image");
                setTableFilter("all");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "image"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Images</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-indigo-400" />
                Indexed Knowledge
              </span>
              <span className="font-bold text-white">{knowledgeList.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] text-center">
              <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">TXT</span>
                <span className="font-semibold text-indigo-300">
                  {knowledgeList.filter((k) => k.source_type === "text").length}
                </span>
              </div>
              <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">PDF</span>
                <span className="font-semibold text-violet-300">
                  {knowledgeList.filter((k) => k.source_type === "pdf").length}
                </span>
              </div>
              <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">IMG</span>
                <span className="font-semibold text-amber-300">
                  {knowledgeList.filter((k) => k.source_type === "image").length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <Link
            to="/chat"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
            <span>Open Student AI Chat</span>
          </Link>

          <div className="flex items-center justify-between px-2 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div className="truncate max-w-[100px]">
                <p className="font-medium text-slate-200 truncate">{user?.name || "Admin"}</p>
                <p className="text-[10px] text-slate-500 uppercase">Administrator</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950 p-6 lg:p-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Admin Knowledge Base
            </h2>
            <p className="text-xs text-slate-400">
              Provide knowledge to the AI Assistant via Text, PDF extraction, or Image OCR.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
            <Shield className="h-3.5 w-3.5 text-indigo-400" />
            <span>Protected Admin Route</span>
          </div>
        </div>

        {/* Active Content Creation Form based on selected content type */}
        <section>
          {activeTab === "text" && (
            <TextUploadForm onKnowledgeAdded={fetchKnowledge} />
          )}

          {activeTab === "pdf" && (
            <PdfUploadForm onKnowledgeAdded={fetchKnowledge} />
          )}

          {activeTab === "image" && (
            <ImageUploadForm onKnowledgeAdded={fetchKnowledge} />
          )}
        </section>

        {/* Uploaded Knowledge Table: Title, Type, Category, Date, Delete button */}
        <section>
          <KnowledgeTable
            knowledgeList={filteredKnowledge}
            onDelete={handleDelete}
            activeFilter={tableFilter}
            onFilterChange={setTableFilter}
          />
        </section>
      </main>
    </div>
  );
}
