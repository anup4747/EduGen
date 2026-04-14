import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ExamView from "../components/ExamView";
import { getExam } from "../api/learnpath";

export default function Exam() {
  const { topic_id, exam_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [exam, setExam] = useState(location.state?.exam ?? null);
  const [topicName] = useState(location.state?.topicName ?? "");
  const [loading, setLoading] = useState(!exam);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (exam || !exam_id) return;

    const loadExam = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getExam(exam_id);
        if (cancelled) return;
        setExam(data);
      } catch (e) {
        if (!cancelled)
          setError(
            e.response?.data?.error || e.message || "Failed to load exam",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadExam();
    return () => {
      cancelled = true;
    };
  }, [exam, exam_id]);

  return (
    <div className="relative min-h-screen bg-[#030305] text-white font-['Inter'] selection:bg-vscode-accent selection:text-white pb-20">
      
      {/* Immersive Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 right-0 w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-vscode-accent/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3"></div>
         <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-indigo-600/5 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-[fade-in-up_0.3s_ease-out_forwards]">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="h-px w-8 bg-vscode-accent"></div>
               <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-vscode-accent">
                 Simulation Active
               </p>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
               {topicName || "Targeted Assessment"}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/learn/${topic_id}`)}
            className="group shrink-0 mt-4 sm:mt-0 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            <span>Abort Simulation</span>
          </button>
        </div>

        <div className="flex-1 rounded-[2.5rem] border border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] animate-[fade-in-up_0.5s_ease-out_forwards] overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 p-16 opacity-50">
               <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-vscode-accent animate-spin mb-4"></div>
               <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Initializing Exam Protocol</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center space-y-6 flex-1 p-16">
              <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <p className="text-rose-400 font-medium text-center max-w-sm">{error}</p>
              <button
                type="button"
                onClick={() => navigate(`/learn/${topic_id}`)}
                className="rounded-full bg-slate-800 border border-slate-700 px-6 py-3 text-sm font-bold text-white hover:bg-slate-700 transition-colors"
               >
                Return to Modules
              </button>
            </div>
          ) : (
            <ExamView exam={exam} topicName={topicName} />
          )}
        </div>
      </div>
    </div>
  );
}
