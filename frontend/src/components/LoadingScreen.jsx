import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { checkStatus } from "../api/learnpath";
import { Sparkles, ArrowRight } from "lucide-react";

const STEPS = [
  "Initializing neural pathways...",
  "Analyzing target subject dimensions...",
  "Synthesizing optimal curriculum...",
  "Curating high-retention content...",
  "Generating targeted mock assessments...",
  "Finalizing personalized roadmap...",
  "Applying finishing touches..."
];

export default function LoadingScreen() {
  const { topic_id } = useParams();
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  // Animate text steps dynamically
  useEffect(() => {
    let timer;
    if (currentStepIndex < STEPS.length - 1 && !failed) {
       timer = setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1);
       }, 3000 + Math.random() * 2000); // Randomize step lengths for realism
    }
    return () => clearTimeout(timer);
  }, [currentStepIndex, failed]);

  // Smooth fake progress bar that crawls toward 90%
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressPercent(prev => {
         if (failed) return prev;
         if (prev >= 90) return prev + 0.1; // Crawl extremely slowly at the end
         return prev + (Math.random() * 3);
      });
    }, 800);
    return () => clearInterval(interval);
  }, [failed]);

  // Real backend polling
  useEffect(() => {
    if (!topic_id) return undefined;
    let cancelled = false;
    const poll = async () => {
      try {
        const { status } = await checkStatus(topic_id);
        if (cancelled) return;
        if (status === "completed") {
           setProgressPercent(100);
           setCurrentStepIndex(STEPS.length - 1);
           setTimeout(() => navigate(`/learn/${topic_id}`, { replace: true }), 800);
        } else if (status === "failed") {
          setFailed(true);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [topic_id, navigate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030305] text-white overflow-hidden font-['Inter']">
      
      {/* Immersive Dark Background Effects */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-vscode-accent/5 blur-[120px]"></div>
          {/* Subtle grid mesh overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_10%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center justify-center px-6">
        
        {/* Mesmerizing CSS Orb Loader */}
        <div className="relative flex items-center justify-center w-64 h-64 mb-16">
           {failed ? (
              <div className="absolute inset-0 rounded-full border-2 border-rose-500/20 animate-pulse bg-rose-500/5 shadow-[0_0_100px_rgba(244,63,94,0.2)]"></div>
           ) : (
             <>
               {/* Core glow */}
               <div className="absolute w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-[30px] animate-pulse"></div>
               <div className="absolute w-32 h-32 bg-vscode-accent/20 rounded-full blur-[40px] animate-pulse" style={{ animationDelay: '1s' }}></div>
               
               {/* Orbital rings */}
               <div className="absolute inset-4 rounded-full border-[1px] border-t-vscode-accent border-r-transparent border-b-purple-500/50 border-l-transparent opacity-60 animate-[spin_4s_linear_infinite]"></div>
               <div className="absolute inset-8 rounded-full border-[1.px] border-t-transparent border-r-indigo-400/60 border-b-transparent border-l-vscode-accent/40 opacity-70 animate-[spin_6s_linear_infinite_reverse]"></div>
               <div className="absolute inset-14 rounded-full border border-dashed border-white/20 animate-[spin_12s_linear_infinite]"></div>
             </>
           )}
           
           <div className={`relative z-10 p-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 ${failed ? 'text-rose-500' : 'text-white'}`}>
             <Sparkles size={32} className={!failed ? 'animate-pulse' : ''}/>
           </div>
        </div>

        {/* Text Area */}
        <div className="w-full text-center space-y-4">
           {failed ? (
              <h1 className="text-4xl font-black tracking-tight text-white animate-[fade-in-up_0.4s_ease-out_forwards]">
                 Generation Failed
              </h1>
           ) : (
              <div className="h-12 overflow-hidden relative">
                 <div 
                   className="absolute left-0 right-0 transition-transform duration-500 ease-in-out"
                   style={{ transform: `translateY(-${currentStepIndex * 48}px)` }}
                 >
                    {STEPS.map((step, idx) => (
                       <div key={idx} className="h-12 flex items-center justify-center">
                          <h2 className={`text-xl sm:text-2xl tracking-wide font-medium transition-opacity duration-500 ${idx === currentStepIndex ? 'text-white opacity-100' : 'text-white/20 opacity-0'}`}>
                             {step}
                          </h2>
                       </div>
                    ))}
                 </div>
              </div>
           )}

           <p className="text-sm font-medium text-slate-400 tracking-wide max-w-md mx-auto leading-relaxed">
              {failed 
                 ? "Our engine encountered a snag while compiling your curriculum. This is usually due to API rate limits or overly broad topics."
                 : "Orchestrating thousands of data points into a cohesive, interactive learning journey tailored exactly for you."}
           </p>

           {/* Progress Line */}
           {!failed && (
             <div className="w-full max-w-md mx-auto pt-8">
               <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-vscode-accent">System Status</span>
                  <span className="text-xs font-bold text-slate-400 font-mono">{Math.min(100, progressPercent).toFixed(1)}%</span>
               </div>
               <div className="h-0.5 w-full bg-white/5 relative overflow-hidden rounded-full">
                  <div 
                     className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-500 via-vscode-accent to-purple-400 transition-all duration-300 ease-out"
                     style={{ width: `${progressPercent}%` }}
                  >
                     {/* Shimmer effect on progress bar */}
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                  </div>
               </div>
             </div>
           )}

           {failed && (
              <div className="pt-8 flex justify-center animate-[fade-in_0.6s_ease-out_forwards]">
                <Link
                  to="/dashboard"
                  className="group flex flex-col items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-white/20 group-hover:bg-white/10 transition-all">
                     <ArrowRight size={20} />
                  </div>
                  <span className="text-xs uppercase font-bold tracking-widest">Return Home</span>
                </Link>
              </div>
           )}
        </div>

      </div>
    </div>
  );
}
