import { useState, useEffect } from "react";
import { generateExam, getExams } from "../api/learnpath";
import { Target, X, Loader2, Play, Activity } from "lucide-react";

export default function PrepMode({ topicId, topicName, userId, onStartExam }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const examData = await getExams(topicId);
        setExams(Array.isArray(examData) ? examData : []);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [topicId]);

  async function handleCreateExam() {
    if (!userId) return;
    setMessage("");
    setGenerating(true);
    try {
      const generated = await generateExam(userId, topicId);
      setExams((prev) => [generated, ...prev]);
      setMessage("Exam matrix compiled. Initiating sequence...");
      setTimeout(() => onStartExam(generated), 1200);
    } catch (error) {
      console.error("Failed to generate exam:", error);
      setMessage(
        error.response?.data?.error || error.message || "Failed to create exam",
      );
      setGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030305]/90 backdrop-blur-2xl animate-[fade-in_0.3s_ease-out_forwards] overflow-hidden font-['Inter']">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-vscode-accent/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[100px]"></div>
          {/* Subtle horizontal tracking lines */}
          <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-full max-w-6xl mx-auto flex flex-col md:flex-row shadow-2xl">
         
         {/* Close Button Top Right */}
         <button
            onClick={() => onStartExam(null)}
            className="absolute top-8 right-8 z-20 p-3 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
         >
            <X size={24} className="group-hover:scale-90 transition-transform" />
         </button>

         {/* Left Side: Copy & Generation Action */}
         <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vscode-accent/20 to-purple-600/10 border border-vscode-accent/20 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(124,58,237,0.2)]">
               <Target size={32} className="text-vscode-accent" />
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4 pr-10">
               Simulation <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-vscode-accent to-purple-500">Environment</span>
            </h1>
            
            <p className="text-lg text-slate-400 mb-12 max-w-sm leading-relaxed">
               Engage in highly targeted assessments mapped specifically to your weakest knowledge nodes in <strong className="text-white font-medium">{topicName}</strong>.
            </p>

            <button
               onClick={handleCreateExam}
               disabled={generating || loading || !userId}
               className="group relative inline-flex items-center justify-center gap-3 w-fit px-8 py-5 rounded-full bg-white text-black font-bold text-[15px] tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:bg-white/5 disabled:text-slate-500 overflow-hidden"
            >
               {/* Hover Shimmer */}
               <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
               
               {generating ? (
                  <><Loader2 size={20} className="animate-spin text-vscode-accent" /> Compiling Matrix...</>
               ) : (
                  <><Activity size={20} /> Generate New Simulation</>
               )}
            </button>
            
            {message && (
               <div className="mt-6 flex items-center gap-3 animate-[fade-in-up_0.3s_ease-out_forwards]">
                  <div className="w-2 h-2 rounded-full bg-vscode-accent animate-pulse"></div>
                  <p className="text-sm font-medium text-vscode-accent">{message}</p>
               </div>
            )}
         </div>

         {/* Right Side: Archives */}
         <div className="w-full md:w-1/2 p-8 md:p-16 border-t md:border-t-0 md:border-l border-white/5 flex flex-col pt-12 md:pt-16 max-h-[80vh] md:max-h-none overflow-y-auto custom-scrollbar">
            <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500 mb-8 border-b border-white/5 pb-4">
               Past Simulations
            </h3>

            {loading ? (
               <div className="flex flex-col items-center justify-center flex-1 h-[300px] opacity-30">
                  <Loader2 size={32} className="animate-spin text-slate-500 mb-4" />
                  <p className="text-xs uppercase tracking-widest font-bold text-slate-600">Accessing Archives</p>
               </div>
            ) : exams.length > 0 ? (
               <div className="grid grid-cols-1 gap-4">
                  {exams.map((exam, i) => (
                     <button
                        key={exam._id}
                        onClick={() => onStartExam(exam)}
                        className="group relative flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-vscode-accent/30 transition-all duration-300 text-left overflow-hidden"
                     >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-vscode-accent/0 group-hover:bg-vscode-accent transition-colors"></div>
                        
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-vscode-accent">
                                 Sim-{String(i + 1).padStart(3, '0')}
                              </span>
                              {exam.completed && (
                                 <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] uppercase font-bold tracking-wider border border-emerald-500/20">
                                    Resolved
                                 </span>
                              )}
                           </div>
                           <h4 className="text-lg font-bold text-white group-hover:text-vscode-accent transition-colors">
                              {exam.title || `Mock Assessment Sequence`}
                           </h4>
                           <p className="text-sm font-medium text-slate-500 mt-1">
                              {exam.questions?.length || 0} Knowledge Nodes
                           </p>
                        </div>

                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-black group-hover:border-transparent transition-all shadow-lg">
                           <Play fill="currentColor" size={16} className="ml-1" />
                        </div>
                     </button>
                  ))}
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center flex-1 h-[300px] border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                  <Activity size={32} className="text-slate-700 mb-4" />
                  <p className="text-sm font-medium text-slate-500">No simulations archived.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
