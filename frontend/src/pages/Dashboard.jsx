import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserTopics, deleteTopic } from "../api/learnpath";
import { Plus, MoreVertical, CheckCircle2, BookOpen, Clock, Menu, X, Trash2 } from "lucide-react";

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deletingTopicId, setDeletingTopicId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) return;
      setError("");
      setLoading(true);
      try {
        const list = await getUserTopics(user.id);
        if (!cancelled) setTopics(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled)
          setError(
            e.response?.data?.error || e.message || "Failed to load topics",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function handleDeleteTopic(topic_id) {
    if (!window.confirm("Delete this topic? This cannot be undone.")) {
      return;
    }
    setDeletingTopicId(topic_id);
    try {
      await deleteTopic(topic_id, user.id);
      setTopics((prev) => prev.filter((topic) => topic._id !== topic_id));
      setActiveMenuId(null);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Failed to delete topic",
      );
    } finally {
      setDeletingTopicId(null);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-[#080b12] text-vscode-text font-['Inter'] selection:bg-vscode-accent selection:text-white">
      {/* Mobile Sidebar Toggle Overlay */}
      {isSidebarOpen && (
         <div 
           className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
           onClick={() => setIsSidebarOpen(false)}
         />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-40 inset-y-0 left-0 w-72 shrink-0 border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl px-6 py-8 transition-transform duration-300 ease-in-out flex flex-col h-full ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex justify-between items-center lg:hidden mb-6">
           <span className="text-sm font-bold text-white tracking-widest uppercase">Menu</span>
           <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="mb-8 rounded-3xl bg-slate-900/50 p-5 ring-1 ring-slate-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-vscode-accent mb-3">
            Workspace
          </p>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Your topics
          </h2>
          <Link
            to="/new-topic"
            className="group relative overflow-hidden mt-5 w-full flex items-center justify-center gap-2 rounded-full bg-vscode-accent px-4 py-3 text-sm font-bold text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer"></div>
            <Plus size={16} /> <span className="relative">New Topic</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 mb-4 px-2">
            Recent
          </p>
          {loading ? (
             <div className="space-y-3 px-2">
                {[1, 2, 3].map(i => (
                   <div key={i} className="h-14 bg-slate-900/50 rounded-2xl animate-pulse"></div>
                ))}
             </div>
          ) : error ? (
            <p className="text-sm text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>
          ) : topics.length === 0 ? (
            <p className="text-sm text-slate-500 px-2 font-medium italic">No topics yet</p>
          ) : (
            <div className="space-y-2.5">
              {topics.map((t, index) => (
                <div
                  key={t._id}
                  className="group relative rounded-2xl bg-transparent px-3 py-3 text-left transition-all hover:bg-slate-900/80 border border-transparent hover:border-slate-800 animate-[fade-in-up_0.5s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 50}ms`, opacity: 0, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                         navigate(`/learn/${t._id}`);
                         setIsSidebarOpen(false);
                      }}
                      className="flex-1 text-left min-w-0"
                    >
                      <span className="block text-sm font-semibold text-slate-200 truncate group-hover:text-vscode-accent transition-colors">
                        {t.topic_name}
                      </span>
                      <div className="mt-1 flex items-center gap-2 text-[10px] font-medium text-slate-500">
                        {t.completed ? (
                           <span className="flex items-center gap-1 text-emerald-400/80"><CheckCircle2 size={10} /> Completed</span>
                        ) : (
                           <span className="flex items-center gap-1 text-amber-400/80"><Clock size={10} /> In progress</span>
                        )}
                      </div>
                    </button>
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setActiveMenuId((current) =>
                            current === t._id ? null : t._id,
                          );
                        }}
                        className={`rounded-full p-1.5 transition-colors ${activeMenuId === t._id ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-800 hover:text-white opacity-0 group-hover:opacity-100"}`}
                      >
                        <MoreVertical size={14} />
                      </button>
                      {activeMenuId === t._id && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-2xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteTopic(t._id);
                            }}
                            disabled={deletingTopicId === t._id}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-50"
                          >
                            <Trash2 size={12} />
                            {deletingTopicId === t._id ? "Deleting…" : "Delete topic"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative bg-[#080b12] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#080b12] to-[#080b12]">
         {/* Mobile Header */}
         <div className="lg:hidden flex items-center p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg bg-slate-900 text-white border border-slate-800">
               <Menu size={20} />
            </button>
            <h1 className="ml-4 text-base font-bold text-white tracking-tight">Dashboard</h1>
         </div>

        <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full">
          {topics.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-slate-950/60 p-12 lg:p-20 ring-1 ring-slate-800 shadow-2xl backdrop-blur-sm border border-slate-800/50 mt-10 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-vscode-accent/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center border border-slate-800 mb-8 shadow-xl">
                    <BookOpen size={32} className="text-vscode-accent" />
                 </div>
                 <h2 className="mb-4 text-3xl font-bold text-white tracking-tight">
                   Welcome to EduGen AI
                 </h2>
                 <p className="mb-10 max-w-md text-sm leading-relaxed text-slate-400 font-medium">
                   Create your first learning topic and let the system instantly generate a
                   full roadmap, interactive lessons, and smart quizzes.
                 </p>
                 <Link
                   to="/new-topic"
                   className="group relative overflow-hidden rounded-full bg-gradient-to-r from-vscode-accent to-purple-600 px-8 py-4 text-sm font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                 >
                   <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer"></div>
                   <Plus size={18} /> <span className="relative">Create your first course</span>
                 </Link>
              </div>
            </div>
          ) : !loading && topics.length > 0 ? (
            <div className="space-y-8 pb-10">
              <header className="mb-10">
                 <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome back.</h1>
                 <p className="text-slate-400 font-medium tracking-wide text-sm">Pick up exactly where you left off.</p>
              </header>
            
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {topics.map((t, idx) => (
                  <div
                    key={t._id}
                    className="group relative flex flex-col rounded-[2rem] bg-slate-900/50 p-6 ring-1 ring-slate-800 shadow-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] hover:bg-slate-900 hover:-translate-y-1 hover:ring-vscode-accent/30 animate-[fade-in-up_0.5s_ease-out_forwards]"
                    style={{ animationDelay: `${idx * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
                  >
                    <div className="mb-6 flex items-start justify-between gap-3 relative z-10">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${t.completed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-vscode-accent/10 border-vscode-accent/20 text-vscode-accent'}`}>
                            {t.completed ? <CheckCircle2 size={18} /> : <BookOpen size={18} />}
                         </div>
                      </div>
                      
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveMenuId((current) => current === t._id ? null : t._id);
                          }}
                          className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {activeMenuId === t._id && (
                          <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-2xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteTopic(t._id);
                              }}
                              disabled={deletingTopicId === t._id}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                              {deletingTopicId === t._id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(`/learn/${t._id}`)}
                        className="flex-1 text-left focus:outline-none focus:ring-0 after:absolute after:inset-0 after:z-0"
                    >
                        <h3 className="text-xl font-bold text-slate-100 mb-2 truncate group-hover:text-vscode-accent transition-colors">
                          {t.topic_name}
                        </h3>
                        <p className="text-sm font-medium text-slate-400">
                          {t.completed
                            ? `Score: ${t.total_score ?? 0} / ${t.max_score ?? 0}`
                            : `${t.level} Level`}
                        </p>
                    </button>

                    <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold uppercase tracking-widest">
                       <span className={t.completed ? "text-emerald-400" : "text-amber-400"}>
                          {t.completed ? "Completed" : "In Progress"}
                       </span>
                       <span className="text-slate-500 group-hover:text-vscode-accent transition-colors">Resume →</span>
                    </div>
                  </div>
                ))}

                 {/* New Topic Card Placeholder */}
                 <div className="hidden sm:flex group relative flex-col items-center justify-center rounded-[2rem] bg-slate-900/20 p-6 ring-1 ring-dashed ring-slate-700 transition-all duration-300 hover:bg-slate-900/40 hover:ring-vscode-accent/50 cursor-pointer min-h-[220px]" onClick={() => navigate('/new-topic')}>
                     <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-vscode-accent transition-all text-slate-400 group-hover:text-white">
                        <Plus size={20} />
                     </div>
                     <p className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Create another topic</p>
                 </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}} />
    </div>
  );
}
