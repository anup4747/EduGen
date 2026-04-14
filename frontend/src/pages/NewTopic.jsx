import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createTopic } from "../api/learnpath";
import { Sparkles, ArrowLeft, Target, AlignJustify } from "lucide-react";

const LEVELS = [
  { id: "Beginner", label: "Beginner" },
  { id: "Intermediate", label: "Intermediate" },
  { id: "Advanced", label: "Advanced" },
];

export default function NewTopic({ user }) {
  const navigate = useNavigate();
  const [topicText, setTopicText] = useState("");
  const [level, setLevel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  async function handleGenerate() {
    if (!user?.id || !topicText.trim() || !level) return;
    setError("");
    setLoading(true);
    try {
      const res = await createTopic(user.id, topicText.trim(), level);
      const tid = res.topic_id;
      if (!tid) throw new Error("No topic id returned");
      navigate(`/loading/${tid}`);
    } catch (e) {
      setError(
        e.response?.data?.error || e.message || "Could not create topic",
      );
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = topicText.trim().length > 0 && level && !loading;

  return (
    <div className="relative min-h-screen bg-[#080b12] px-4 py-8 sm:px-6 lg:px-8 overflow-hidden font-['Inter'] selection:bg-vscode-accent selection:text-white">
      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-vscode-accent/20 via-[#080b12] to-transparent opacity-60 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto custom-scrollbar">
         <button 
           onClick={() => navigate('/dashboard')}
           className="group mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
         >
            <div className="p-2 rounded-full bg-slate-900 group-hover:bg-slate-800 transition-colors">
               <ArrowLeft size={16} />
            </div>
            Back to Dashboard
         </button>

         <div className={`mx-auto max-w-3xl rounded-[2.5rem] bg-slate-950/80 backdrop-blur-xl p-8 lg:p-12 ring-1 ring-slate-800/80 shadow-[0_0_50px_rgba(124,58,237,0.1)] transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
           <div className="mb-10 text-center space-y-3">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 mb-4 shadow-xl">
               <Sparkles className="w-8 h-8 text-vscode-accent" />
             </div>
             <p className="text-xs font-bold uppercase tracking-[0.28em] text-vscode-accent">
               AI Generator
             </p>
             <h1 className="text-4xl font-bold text-white tracking-tight">
               What would you like to learn?
             </h1>
             <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-400 font-medium">
               Describe the subject, and our AI will synthesize a structured roadmap, complete chapters, and dynamic quizzes tailored just for you.
             </p>
           </div>
           
           <div className="space-y-8">
             <div className="space-y-3 group">
               <label className="flex items-center gap-2 text-sm font-bold text-white/90 transition-colors group-focus-within:text-vscode-accent">
                 <AlignJustify size={16} /> Learning Topic
               </label>
               <textarea
                 value={topicText}
                 onChange={(e) => setTopicText(e.target.value)}
                 rows={4}
                 placeholder="e.g. Master React context and hooks, Basics of Python for data science, Product design fundamentals from scratch..."
                 className="w-full resize-none rounded-[1.5rem] border border-slate-700/80 bg-slate-900/50 px-5 py-4 text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-vscode-accent focus:bg-slate-900 focus:ring-4 focus:ring-vscode-accent/10 hover:border-slate-600 custom-scrollbar"
               />
             </div>
             
             <div>
               <label className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                  <Target size={16} /> Select Difficulty
               </label>
               <div className="flex flex-wrap gap-4">
                 {LEVELS.map((l) => (
                   <button
                     key={l.id}
                     type="button"
                     onClick={() => setLevel(l.id)}
                     className={`flex-1 rounded-2xl border px-6 py-4 text-sm font-bold transition-all duration-300 ${
                       level === l.id
                         ? "border-vscode-accent bg-vscode-accent/10 text-vscode-accent shadow-[0_0_20px_rgba(124,58,237,0.2)] scale-[1.02]"
                         : "border-slate-700/80 bg-slate-900/50 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
                     }`}
                   >
                     {l.label}
                   </button>
                 ))}
               </div>
             </div>
             
             {error ? (
                 <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 shrink-0 animate-[fade-in-up_0.3s_ease-out_forwards]">
                    <p className="text-sm font-medium text-rose-400 text-center">{error}</p>
                 </div>
             ) : null}
             
             <div className="pt-4">
                 <button
                   type="button"
                   disabled={!canSubmit}
                   onClick={handleGenerate}
                   className="group relative overflow-hidden w-full rounded-full bg-gradient-to-r from-vscode-accent to-purple-600 px-6 py-5 text-base font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                   <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                         <>
                            <Sparkles size={18} className="animate-pulse" />
                            Synthesizing Learning Path...
                         </>
                      ) : "Generate Knowledge Base"}
                   </span>
                 </button>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
}
