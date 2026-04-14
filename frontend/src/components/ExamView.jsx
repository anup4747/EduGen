import { useMemo, useState } from "react";
import { submitExam } from "../api/learnpath";
import { CheckCircle2, ChevronLeft, ChevronRight, Save, Award, Target, HelpCircle, Activity } from "lucide-react";

function mcqMarksPerQuestion(exam) {
  const n = (exam?.mcq_questions || []).length;
  if (!n) return 0;
  const totalMcq =
    exam.exam_type === "final" ? 15 : Math.min(10, exam.total_marks || 30);
  return totalMcq / n;
}

export default function ExamView({
  exam,
  topicName,
  onDone,
  onRefresh,
  courseSummary,
}) {
  const mcqs = exam?.mcq_questions || [];
  const shorts = exam?.short_questions || [];
  const isFinal = exam?.exam_type === "final";
  let capstone = exam?.capstone_parsed;
  if (!capstone && exam?.capstone && typeof exam.capstone === "string") {
    try {
      capstone = JSON.parse(exam.capstone);
    } catch {
      capstone = null;
    }
  }
  const practical = exam?.practical_task || null;

  const [phase, setPhase] = useState(0);
  const [mcqIdx, setMcqIdx] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [shortText, setShortText] = useState({});
  const [shortMarks, setShortMarks] = useState([]);
  const [shortRevealed, setShortRevealed] = useState(false);
  const [projectText, setProjectText] = useState("");
  const [projectMarks, setProjectMarks] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const marksEachMcq = useMemo(() => mcqMarksPerQuestion(exam), [exam]);
  const passMarks = exam?.pass_marks ?? (isFinal ? 35 : 20);
  const maxMarks = exam?.total_marks ?? (isFinal ? 50 : 30);

  const mcqScore = useMemo(() => {
    let s = 0;
    mcqs.forEach((q, i) => {
      if (mcqAnswers[String(i)] === q.correct_answer) s += marksEachMcq;
    });
    return Math.round(s * 100) / 100;
  }, [mcqs, mcqAnswers, marksEachMcq]);

  function initShortMarks() {
    setShortMarks(shorts.map((sh) => sh.marks || 5));
  }

  async function finalizeExam() {
    setError("");
    const shortTotal = shortRevealed
      ? shortMarks.reduce((a, b) => a + (Number(b) || 0), 0)
      : 0;
    const projMax = isFinal
      ? capstone?.marks ?? 20
      : practical?.marks ?? 10;
    const projScore = Math.min(Number(projectMarks) || 0, projMax);
    const shortMax = shorts.reduce((a, sh) => a + (sh.marks || 5), 0);
    const shortActual = Math.min(shortTotal, shortMax);
    const total = Math.min(
      maxMarks,
      Math.round((mcqScore + shortActual + projScore) * 100) / 100,
    );
    const user_answers = {
      mcq: mcqAnswers,
      short: shortText,
      short_marks: shortMarks,
      project: projectText,
      project_marks: projScore,
    };
    setSaving(true);
    try {
      await submitExam(exam._id, user_answers, total);
      if (onRefresh) await onRefresh();
      if (onDone)
        await Promise.resolve(onDone(total, maxMarks, passMarks, isFinal));
      setTotalScore(total);
      setSubmitted(true);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const mcq = mcqs[mcqIdx];

  // -------------------------------------------------------------
  // RESULTS VIEW
  // -------------------------------------------------------------
  if (submitted && totalScore !== null) {
    const passed = totalScore >= passMarks;
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[500px] overflow-hidden p-8 text-white animate-[fade-in_0.5s_ease-out_forwards]">
        {isFinal && passed && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <span
                key={i}
                className="absolute h-3 w-3 rounded-full opacity-80 mix-blend-screen"
                style={{
                  left: `${(i * 13) % 100}%`,
                  top: "-20px",
                  background: ["#7c3aed", "#4ec9b0", "#f44747", "#fbbf24"][i % 4],
                  boxShadow: `0 0 15px ${["#7c3aed", "#4ec9b0", "#f44747", "#fbbf24"][i % 4]}`,
                  animation: `confetti-fall ${2 + (i % 5) * 0.2}s ease-in forwards`,
                  animationDelay: `${(i % 8) * 0.15}s`,
                }}
              />
            ))}
            <style>{`
              @keyframes confetti-fall {
                to { transform: translateY(120vh) rotate(720deg) scale(0.5); opacity: 0; }
              }
            `}</style>
          </div>
        )}
        
        <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center mb-6 shadow-2xl ${passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-rose-500/20'}`}>
             {passed ? <Award size={48} /> : <Target size={48} />}
          </div>

          <h2 className="mb-2 text-3xl font-black tracking-tight text-white">
            {passed ? "Assessment Passed" : "Assessment Failed"}
          </h2>
          <p className="text-slate-400 mb-8 max-w-sm text-center">
            {passed ? "Outstanding performance. Your neural model has successfully integrated this knowledge." : "Your score fell short of the required threshold. Review your weak nodes and re-engage the simulation."}
          </p>
          
          <div className="w-full rounded-[2rem] border border-white/5 bg-slate-900/50 p-8 backdrop-blur-xl mb-6 relative overflow-hidden">
             
             {/* Progress sweep effect */}
             <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5">
                <div className={`h-full ${passed ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${(totalScore/maxMarks)*100}%`}}></div>
             </div>

             <div className="flex justify-between items-end mb-4">
               <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-1">Final Score</p>
                  <p className="text-5xl font-black text-white">{totalScore}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-1">Max Score</p>
                  <p className="text-2xl font-bold text-slate-400">/ {maxMarks}</p>
               </div>
             </div>
             
             <div className="mt-6 pt-6 border-t border-white/5 flex gap-4">
                <div className="flex-1 rounded-xl bg-slate-900/80 p-4 border border-white/5">
                   <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Pass Mark</p>
                   <p className="font-mono text-lg font-bold text-slate-300">{passMarks}</p>
                </div>
                {courseSummary && isFinal && passed && (
                  <div className="flex-1 rounded-xl bg-vscode-accent/10 p-4 border border-vscode-accent/20">
                     <p className="text-[10px] uppercase tracking-wider text-vscode-accent mb-1">Course GPA</p>
                     <p className="font-mono text-lg font-bold text-white">{courseSummary.pct}%</p>
                  </div>
                )}
             </div>
          </div>
          
          {error && <p className="mb-4 text-sm font-medium text-rose-500 bg-rose-500/10 py-2 px-4 rounded-lg">{error}</p>}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PHASE 0: MCQ
  // -------------------------------------------------------------
  if (phase === 0) {
    const n = mcqs.length;
    return (
      <div className="flex min-h-[500px] flex-col p-6 sm:p-10 text-white animate-[fade-in_0.3s_ease-out_forwards]">
        
        {/* MCQ Header Progress */}
        <div className="mb-8">
           <div className="flex justify-between items-end mb-3">
              <h2 className="text-2xl font-bold tracking-tight">
                {isFinal ? "Final Evaluation" : "Module Checkpoint"} <span className="text-slate-500 font-normal">/ Multi-choice Node</span>
              </h2>
              <p className="text-xs font-bold font-mono text-vscode-accent bg-vscode-accent/10 px-3 py-1 rounded-full border border-vscode-accent/20">
                {String(mcqIdx + 1).padStart(2, '0')} <span className="text-slate-500">/ {String(n).padStart(2, '0')}</span>
              </p>
           </div>
           
           <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden flex gap-1">
             {mcqs.map((sq, i) => (
                <div 
                  key={i} 
                  className={`h-full flex-1 transition-colors duration-300 ${mcqAnswers[i] ? 'bg-vscode-accent shadow-[0_0_10px_rgba(124,58,237,0.5)]' : i === mcqIdx ? 'bg-slate-500' : 'bg-transparent'}`}
                />
             ))}
           </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full mb-12">
           <h3 className="text-2xl sm:text-3xl font-medium leading-relaxed text-white mb-10 text-center">
              {mcq?.question}
           </h3>

           {/* Sleek Custom Options */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {["A", "B", "C", "D"].map((L) => {
                const text = mcq?.options?.[L] ?? "";
                const selected = mcqAnswers[String(mcqIdx)] === L;
                return (
                  <button
                    key={L}
                    type="button"
                    onClick={() => setMcqAnswers((a) => ({ ...a, [String(mcqIdx)]: L }))}
                    className={`group relative flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-300 ${
                      selected
                        ? "border-vscode-accent bg-vscode-accent/10 shadow-[0_0_30px_rgba(124,58,237,0.15)] -translate-y-1"
                        : "border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    {/* Floating Selection Indicator */}
                    {selected && (
                       <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-vscode-accent/5 to-transparent pointer-events-none"></div>
                    )}

                    <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full border transition-colors duration-300 ${
                       selected ? 'border-vscode-accent bg-vscode-accent text-white font-black' : 'border-slate-600 text-slate-400 group-hover:border-slate-400 font-bold'
                    }`}>
                      {L}
                    </div>
                    <span className={`text-[15px] leading-snug transition-colors ${selected ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white'}`}>
                      {text}
                    </span>
                  </button>
                );
             })}
           </div>
        </div>

        {/* Action Footer */}
        <div className="mt-auto border-t border-white/5 pt-6 flex justify-between items-center w-full max-w-3xl mx-auto">
          <button
            type="button"
            disabled={mcqIdx === 0}
            onClick={() => setMcqIdx((i) => Math.max(0, i - 1))}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-white text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            type="button"
            disabled={
              Object.keys(mcqAnswers).length < n ||
              Object.keys(mcqAnswers).some((k) => !mcqAnswers[k])
            }
            onClick={() => { initShortMarks(); setPhase(1); }}
            className={`group relative flex items-center gap-3 rounded-full px-8 py-3 text-[14px] font-bold tracking-wide transition-all overflow-hidden ${
               Object.keys(mcqAnswers).length < n || Object.keys(mcqAnswers).some((k) => !mcqAnswers[k])
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-white text-black hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            }`}
          >
             {!(Object.keys(mcqAnswers).length < n || Object.keys(mcqAnswers).some((k) => !mcqAnswers[k])) && (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
             )}
            Advance Phase <ChevronRight size={16} />
          </button>

          <button
            type="button"
            disabled={mcqIdx >= n - 1}
            onClick={() => setMcqIdx((i) => Math.min(n - 1, i + 1))}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-white text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PHASE 1: SHORT ANSWER
  // -------------------------------------------------------------
  if (phase === 1) {
    return (
      <div className="flex min-h-[500px] flex-col overflow-y-auto p-6 sm:p-10 text-white custom-scrollbar animate-[fade-in_0.3s_ease-out_forwards]">
        
        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
           <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">
                Conceptual Deep-Dive
              </h2>
              <p className="text-sm font-medium text-slate-400">Written response subjective evaluation</p>
           </div>
           <div className="hidden sm:flex items-center gap-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
               <HelpCircle size={16} />
               <span className="text-xs font-bold uppercase tracking-wider">Self-Graded</span>
           </div>
        </div>

        <div className="space-y-12 max-w-3xl mx-auto w-full mb-10">
          {shorts.map((sh, i) => (
            <div
              key={i}
              className="relative p-6 sm:p-8 rounded-[2rem] border border-slate-800 bg-slate-900/40 shadow-xl"
            >
              {/* Question Number Badge */}
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-slate-300 shadow-lg">
                 Q{i+1}
              </div>

              <p className="text-lg font-medium text-white mb-6 leading-relaxed ml-2">{sh.question}</p>
              
              <div className="relative group mb-2">
                 <textarea
                   value={shortText[String(i)] || ""}
                   onChange={(e) => setShortText((t) => ({ ...t, [String(i)]: e.target.value }))}
                   disabled={shortRevealed}
                   rows={4}
                   placeholder="Type your explanation here..."
                   className="w-full resize-y rounded-2xl border border-slate-700 bg-black/40 p-5 text-[15px] leading-relaxed text-slate-200 placeholder-slate-600 transition-all outline-none focus:border-vscode-accent focus:bg-slate-900 focus:ring-4 focus:ring-vscode-accent/10 disabled:opacity-60 custom-scrollbar"
                 />
                 {!shortRevealed && (
                    <div className="absolute right-4 bottom-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                       Auto-saving...
                    </div>
                 )}
              </div>

              {shortRevealed && (
                <div className="mt-8 pt-8 border-t border-dashed border-white/10 animate-[fade-in-up_0.4s_ease-out_forwards]">
                  <div className="mb-6 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                     <div className="flex flex-col gap-2 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">System Blueprint</span>
                        <p className="text-sm font-medium text-emerald-100/80 leading-relaxed">
                          {sh.expected_answer}
                        </p>
                     </div>
                  </div>
                  
                  {/* Premium Slider Validation Area */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-black/30 border border-slate-800/80">
                     <div className="flex flex-col gap-1 w-full sm:w-auto">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-vscode-accent">Validation</span>
                        <span className="text-sm font-semibold text-slate-300 max-w-[200px]">How completely did you answer this node?</span>
                     </div>
                     <div className="flex-1 w-full flex items-center gap-4">
                        <input
                          type="range"
                          min={0}
                          max={sh.marks || 5}
                          value={shortMarks[i] ?? 0}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setShortMarks((m) => {
                              const next = [...m];
                              next[i] = v;
                              return next;
                            });
                          }}
                          className="flex-1 h-2 rounded-full appearance-none bg-slate-800 outline-none  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-vscode-accent [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(124,58,237,0.5)] [&::-webkit-slider-thumb]:cursor-pointer"
                        />
                     </div>
                     <div className="w-16 shrink-0 flex items-center justify-center p-3 rounded-xl bg-slate-800 border-2 border-slate-700">
                        <span className="font-mono text-xl font-bold text-white">{shortMarks[i] ?? 0}</span>
                     </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Footer */}
        <div className="mt-auto border-t border-white/5 pt-6 flex justify-between items-center w-full max-w-3xl mx-auto pb-4">
          {!shortRevealed ? (
            <>
              <button
                type="button"
                onClick={() => setPhase(0)}
                className="rounded-full border border-slate-700 hover:bg-slate-800 text-slate-300 px-6 py-2.5 text-sm font-bold transition-colors"
              >
                Back to MCQ
              </button>
              <button
                type="button"
                onClick={() => { initShortMarks(); setShortRevealed(true); }}
                className="flex items-center gap-2 rounded-full bg-vscode-accent px-8 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-105 active:scale-95 transition-all"
              >
                <Activity size={16} /> Evaluate Responses
              </button>
            </>
          ) : (
            <>
              <div></div> {/* spacer */}
              <button
                type="button"
                onClick={() => setPhase(2)}
                className="group flex items-center gap-3 rounded-full bg-white px-8 py-3 text-sm font-bold text-black border border-white hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all overflow-hidden relative"
              >
                 <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                Proceed to Final <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PHASE 2: PROJECT / PRACTICAL
  // -------------------------------------------------------------
  const projMax = isFinal ? capstone?.marks ?? 20 : practical?.marks ?? 10;

  return (
    <div className="flex min-h-[500px] flex-col overflow-y-auto p-6 sm:p-10 text-white custom-scrollbar animate-[fade-in_0.3s_ease-out_forwards]">
      
      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
         <div>
            <h2 className="text-2xl font-bold tracking-tight mb-1">
              {isFinal ? "Capstone Simulation" : "Practical Evaluation"}
            </h2>
            <p className="text-sm font-medium text-slate-400">Synthesis and application of concepts</p>
         </div>
      </div>

      <div className="max-w-3xl mx-auto w-full mb-10">
        
        {/* Project Description Block */}
        {isFinal && capstone && (
          <div className="mb-10 rounded-[2rem] border border-purple-500/20 bg-gradient-to-b from-purple-500/10 to-transparent p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-vscode-accent to-purple-500"></div>
            
            <h3 className="mb-4 text-2xl font-bold tracking-tight text-white flex items-center gap-3">
               <Target className="text-purple-400" />
               {capstone.title}
            </h3>
            <p className="mb-8 text-slate-300 leading-relaxed font-medium">
              {capstone.problem_statement}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div>
                  <p className="mb-4 text-[10px] uppercase font-black tracking-[0.2em] text-vscode-accent border-b border-vscode-accent/20 pb-2">
                    Key Requirements
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {(capstone.requirements || []).map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                         <span className="text-vscode-accent shrink-0 mt-1">•</span> <span>{r}</span>
                      </li>
                    ))}
                  </ul>
               </div>
               <div>
                  <p className="mb-4 text-[10px] uppercase font-black tracking-[0.2em] text-amber-500 border-b border-amber-500/20 pb-2">
                    Evaluation Matrix
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {(capstone.evaluation_criteria || []).map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                         <span className="text-amber-500 shrink-0 mt-1">•</span> <span>{r}</span>
                      </li>
                    ))}
                  </ul>
               </div>
            </div>
          </div>
        )}

        {!isFinal && practical && (
          <div className="mb-8 rounded-[2rem] border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent p-8">
            <div className="flex items-start gap-4">
               <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <Activity />
               </div>
               <div>
                  <p className="mb-2 text-xl font-bold">{practical.question}</p>
                  <p className="text-[15px] leading-relaxed text-emerald-100/70">{practical.description}</p>
               </div>
            </div>
          </div>
        )}

        {/* User Input Block */}
        <div className="relative group mb-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Your Solution Design</h4>
            <textarea
              value={projectText}
              onChange={(e) => setProjectText(e.target.value)}
              rows={8}
              placeholder="Architect your solution here. Focus on clarity and addressing the constraints..."
              className="w-full resize-y rounded-[2rem] border border-slate-700 bg-black/40 p-6 text-[15px] leading-relaxed text-slate-200 placeholder-slate-600 transition-all outline-none focus:border-vscode-accent focus:bg-slate-900 focus:ring-4 focus:ring-vscode-accent/10 custom-scrollbar"
            />
        </div>

        {/* Premium Slider Validation Area */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:px-8 sm:py-6 rounded-3xl bg-black/30 border border-slate-800/80 shadow-lg">
           <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-vscode-accent">Objective Grading</span>
              <span className="text-sm font-semibold text-slate-300 max-w-[200px]">Self-Evaluate Execution</span>
           </div>
           <div className="flex-1 w-full flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={projMax}
                value={projectMarks}
                onChange={(e) => setProjectMarks(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-slate-800 outline-none  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-vscode-accent [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(124,58,237,0.5)] [&::-webkit-slider-thumb]:cursor-pointer"
              />
           </div>
           <div className="w-16 shrink-0 flex items-center justify-center p-3 rounded-xl bg-slate-800 border-2 border-slate-700">
              <span className="font-mono text-xl font-bold text-white">{projectMarks}</span>
           </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center animate-[fade-in_0.2s_ease-out_forwards]">
            <p className="text-sm font-medium text-rose-500">{error}</p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-auto border-t border-white/5 pt-6 flex justify-between items-center w-full max-w-3xl mx-auto pb-4">
        <button
          type="button"
          onClick={() => setPhase(1)}
          className="rounded-full border border-slate-700 hover:bg-slate-800 text-slate-300 px-6 py-2.5 text-sm font-bold transition-colors"
        >
          Previous Section
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={finalizeExam}
          className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-vscode-accent to-purple-600 px-8 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:scale-105 active:scale-95 transition-all overflow-hidden relative"
        >
           {!saving && (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
           )}
          {saving ? "Finalizing Network..." : "Commit Simulation"} 
          <Save size={16} className={saving ? 'animate-pulse' : ''} />
        </button>
      </div>
    </div>
  );
}
