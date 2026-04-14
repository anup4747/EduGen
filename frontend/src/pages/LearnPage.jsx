import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  getChapters,
  getExams,
  getQuizzes,
  getTopic,
  saveStudySession,
} from "../api/learnpath";
import BlogView from "../components/BlogView";
import ChatBot from "../components/ChatBot";
import QuizView from "../components/QuizView";
import ResultView from "../components/ResultView";
import RoadmapView from "../components/RoadmapView";
import NotesPanel from "../components/NotesPanel";
import PrepMode from "../components/PrepMode";
import { Map, BookOpen, PenTool, Trophy, CheckCircle2, Target, ArrowLeft, ChevronRight, X, Menu, Circle, FileText, Bot, MessageCircle } from "lucide-react";

function sortChapters(ch) {
  return [...ch].sort(
    (a, b) => (a.chapter_number || 0) - (b.chapter_number || 0),
  );
}

export default function LearnPage({ user }) {
  const { topic_id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [chatContext, setChatContext] = useState("");
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showPrepMode, setShowPrepMode] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [notesVersion, setNotesVersion] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const studySecondsRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!topic_id || !user?.id) return;
    const [ch, qz, examList] = await Promise.all([
      getChapters(topic_id),
      getQuizzes(topic_id),
      getExams(topic_id).catch(() => []),
    ]);
    setChapters(Array.isArray(ch) ? ch : []);
    setQuizzes(Array.isArray(qz) ? qz : []);
    setExams(Array.isArray(examList) ? examList : []);
  }, [topic_id, user?.id]);

  const sendStudyTime = useCallback(
    async (seconds) => {
      if (!topic_id || !user?.id || seconds <= 0) return;
      try {
        await saveStudySession(user.id, topic_id, seconds);
      } catch (e) {
        console.error("Error saving study session:", e);
      }
    },
    [topic_id, user?.id],
  );

  useEffect(() => {
    if (!topic_id || !user?.id) return;
    const interval = setInterval(() => {
      studySecondsRef.current += 15;
      if (studySecondsRef.current >= 60) {
        const seconds = studySecondsRef.current;
        studySecondsRef.current = 0;
        sendStudyTime(seconds);
      }
    }, 15000);

    return () => {
      if (studySecondsRef.current > 0) {
        sendStudyTime(studySecondsRef.current);
        studySecondsRef.current = 0;
      }
      clearInterval(interval);
    };
  }, [topic_id, user?.id, sendStudyTime]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!topic_id) return;
      setLoading(true);
      setError("");
      try {
        const t = await getTopic(topic_id);
        if (cancelled) return;
        setTopic(t);
        await refresh();
        if (!cancelled) {
          setTabs([{ id: "roadmap", title: "Roadmap", type: "roadmap" }]);
          setActiveTabId("roadmap");
        }
      } catch (e) {
        if (!cancelled)
          setError(e.response?.data?.error || e.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [topic_id, refresh]);

  const sortedChapters = useMemo(() => sortChapters(chapters), [chapters]);
  const roadmapList = useMemo(() => {
    const r = topic?.roadmap;
    if (Array.isArray(r)) return r;
    if (r?.chapters) return r.chapters;
    return [];
  }, [topic]);

  const quizByChapter = useMemo(() => {
    const m = {};
    quizzes.forEach((q) => {
      m[q.chapter_number] = q;
    });
    return m;
  }, [quizzes]);

  const resultItems = useMemo(() => {
    const quizResults = quizzes.map((q) => ({
      id: q._id,
      title: `Quiz ${q.chapter_number}`,
      detail: q.completed
        ? `${q.score}/${q.questions?.length || 5}`
        : "Pending",
      status: q.completed ? "Completed" : "Open",
      icon: <PenTool size={14} />,
      type: "quiz",
      completed: q.completed,
    }));

    const examResults = exams.map((exam) => ({
      id: exam._id,
      title: exam.title || `Exam ${exam.exam_number || ""}`,
      detail: exam.completed
        ? `${exam.score}/${exam.total_marks || 0}`
        : "Ready",
      status: exam.completed ? "Completed" : "Ready",
      icon: <Target size={14} />,
      type: "exam",
      completed: exam.completed,
    }));

    return [...quizResults, ...examResults];
  }, [quizzes, exams]);

  function openTab(tab) {
    setTabs((prev) => {
      if (prev.some((t) => t.id === tab.id)) return prev;
      return [...prev, tab];
    });
    setActiveTabId(tab.id);
  }

  function showRoadmap() {
    openTab({ id: "roadmap", title: "Roadmap", type: "roadmap" });
    setChatContext("Course roadmap overview");
  }

  function showChapter(ch, idx) {
    openTab({
      id: `blog-${ch._id}`,
      title: ch.title?.slice(0, 24) || `Ch ${ch.chapter_number}`,
      type: "blog",
      chapter: ch,
      index: idx,
    });
    setChatContext(ch.content?.slice(0, 2000) || ch.title || "");
    if(window.innerWidth < 1024) setIsSidebarOpen(false);
  }

  function showQuiz(q) {
    openTab({
      id: `quiz-${q._id}`,
      title: `Quiz ${q.chapter_number}`,
      type: "quiz",
      quiz: q,
    });
    setChatContext("Chapter quiz");
    if(window.innerWidth < 1024) setIsSidebarOpen(false);
  }

  function showResults() {
    openTab({ id: "results", title: "Results", type: "results" });
    setChatContext("Course results and scores");
    if(window.innerWidth < 1024) setIsSidebarOpen(false);
  }

  function closeTab(e, id) {
    e.stopPropagation();
    setTabs((prev) => {
       const newTabs = prev.filter(t => t.id !== id);
       if (activeTabId === id && newTabs.length > 0) {
          setActiveTabId(newTabs[newTabs.length - 1].id);
       }
       return newTabs;
    });
  }

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080b12] text-white">
         <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-vscode-accent animate-spin"></div>
             <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">Loading Environment...</p>
         </div>
      </div>
    );
  }
  if (error || !topic) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#080b12] px-4 text-center">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-3xl flex items-center justify-center mb-2">
           <X size={32} />
        </div>
        <p className="text-rose-400 font-medium text-lg">{error || "Learning topic not found"}</p>
        <Link
          to="/dashboard"
          className="rounded-full bg-slate-800/80 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-700/80 hover:shadow-xl flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#080b12] text-white font-['Inter'] selection:bg-vscode-accent selection:text-white">
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800">
                 <Menu size={20} />
             </button>
             <h1 className="text-sm font-bold text-white truncate max-w-[200px]">{topic.topic_name}</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl text-slate-400 bg-slate-900 border border-slate-800">
             <X size={16} />
          </button>
      </header>
      
      <div className="flex min-h-0 flex-1 relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
           <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:relative z-40 inset-y-0 left-0 w-72 shrink-0 border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-transform duration-300 ease-in-out flex flex-col h-full ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div className="hidden lg:flex shrink-0 p-6 border-b border-slate-800/80 items-center justify-between">
             <div className="flex-1 min-w-0 pr-4">
                 <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-vscode-accent mb-1 truncate">Current Topic</h2>
                 <p className="text-sm font-bold text-white truncate">{topic.topic_name}</p>
             </div>
             <button onClick={() => navigate('/dashboard')} className="shrink-0 p-2 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors group">
                 <X size={14} className="text-slate-400 group-hover:text-white" />
             </button>
          </div>
          
          <div className="shrink-0 p-4 space-y-2">
            <button
              type="button"
              onClick={showRoadmap}
              className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 hover:bg-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex justify-center items-center gap-3">
                 <Map size={18} className="text-sky-400" />
                 <span className="text-sm font-bold text-slate-300 group-hover:text-white">Roadmap Overview</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNotesPanel(true);
                if(window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 hover:bg-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex justify-center items-center gap-3">
                 <FileText size={18} className="text-amber-400" />
                 <span className="text-sm font-bold text-slate-300 group-hover:text-white">Personal Notes</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                 setShowPrepMode(true);
                 if(window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 hover:bg-slate-800 hover:border-slate-700 transition"
            >
               <div className="flex items-center gap-3">
                 <Target size={18} className="text-rose-400" />
                 <span className="text-sm font-bold text-slate-300 group-hover:text-white">Prep Mode</span>
               </div>
            </button>
            
            {exams.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  navigate(`/learn/${topic_id}/exam/${exams[0]._id}`, {
                    state: { exam: exams[0], topicName: topic?.topic_name },
                  })
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-vscode-accent to-purple-600 px-4 py-3 text-xs font-bold text-white tracking-wide shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition"
              >
                <Target size={14} /> Start Next Exam
              </button>
            )}
          </div>
          
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
            <p className="mt-2 mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Curriculum Modules
            </p>
            <div className="space-y-1 relative before:absolute before:inset-y-0 before:left-[17px] before:w-px before:bg-slate-800/80">
              {sortedChapters.map((ch, idx) => {
                const qz = quizByChapter[ch.chapter_number];
                const done = qz?.completed;
                return (
                  <div key={ch._id} className="relative pl-10 pr-2 py-1">
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border-4 border-[#080b12] z-10 flex items-center justify-center ${done ? 'bg-emerald-500 border-emerald-900' : 'bg-slate-800'}`}>
                       {done ? <CheckCircle2 size={12} className="text-white" /> : <BookOpen size={12} className="text-slate-400" />}
                    </div>
                    <button
                      type="button"
                      onClick={() => showChapter(ch, idx)}
                      className="group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left bg-slate-900/30 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700/80"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                         <span className="text-[10px] font-bold text-vscode-accent uppercase tracking-wider mb-0.5">Chapter {ch.chapter_number}</span>
                         <span className="truncate text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                           {ch.title}
                         </span>
                      </div>
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-vscode-accent shrink-0" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quizzes List */}
            <p className="mt-8 mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
               Chapter Quizzes
            </p>
            <div className="space-y-1">
               {quizzes.length > 0 ? sortChapters(quizzes).map((q) => (
                 <button
                   key={`sidebar-quiz-${q._id}`}
                   type="button"
                   onClick={() => showQuiz(q)}
                   className="group flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-left bg-slate-900/30 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700/80"
                 >
                   <div className="flex flex-col min-w-0 pr-2">
                       <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors flex items-center gap-2">
                         <PenTool size={14} className="text-purple-400" />
                         Quiz {q.chapter_number}
                       </span>
                   </div>
                   {q.completed && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                 </button>
               )) : (
                 <p className="text-xs text-slate-500 italic px-2">No quizzes available.</p>
               )}
            </div>

            <div className="mt-8 rounded-[1.5rem] bg-slate-900/50 p-5 ring-1 ring-slate-800 shadow-xl border-t border-slate-700">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                       <Trophy size={14} />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                     Results
                   </p>
                </div>
                <button
                  type="button"
                  onClick={showResults}
                  className="rounded-full bg-slate-800 px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-300 hover:text-white hover:bg-slate-700 transition"
                >
                  View All
                </button>
              </div>
              <ul className="space-y-2.5">
                {resultItems.length > 0 ? (
                  resultItems.slice(0, 3).map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={showResults}
                        className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-left text-sm hover:bg-slate-800 transition-colors"
                      >
                         <div className="flex flex-col gap-1 min-w-0">
                           <span className="flex items-center gap-2 text-xs font-bold text-slate-300 group-hover:text-white truncate">
                             <span className="text-vscode-accent">{item.icon}</span> 
                             {item.title}
                           </span>
                           <span className="text-[10px] font-medium text-slate-500">
                              Score: {item.detail}
                           </span>
                         </div>
                         <span
                           className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${
                              item.completed
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-800/50 text-slate-400 border-slate-700"
                           }`}
                         >
                            {item.status}
                         </span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li>
                    <p className="text-xs text-slate-500 font-medium italic">
                      No results to display yet.
                    </p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex min-w-0 flex-1 flex-col bg-[#0e111a] relative z-10 w-full rounded-tl-none lg:rounded-tl-2xl ring-1 ring-slate-800/50 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
          {/* Tab Navigation */}
          <div className="flex h-14 shrink-0 items-end gap-1 overflow-x-auto border-b border-slate-800/80 bg-slate-950/40 px-2 pt-2 custom-scrollbar">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`group relative flex max-w-[200px] shrink-0 items-center justify-between gap-3 rounded-t-xl px-4 py-2.5 text-xs font-bold cursor-pointer transition-all duration-300 ${
                  activeTabId === tab.id
                    ? "bg-[#0e111a] text-white border-t border-l border-r border-slate-700/80"
                    : "text-slate-400 hover:bg-slate-900/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                   {tab.type === 'roadmap' && <Map size={14} className={activeTabId === tab.id ? 'text-sky-400' : ''} />}
                   {tab.type === 'blog' && <BookOpen size={14} className={activeTabId === tab.id ? 'text-emerald-400' : ''} />}
                   {tab.type === 'quiz' && <PenTool size={14} className={activeTabId === tab.id ? 'text-purple-400' : ''} />}
                   {tab.type === 'results' && <Trophy size={14} className={activeTabId === tab.id ? 'text-amber-400' : ''} />}
                   <span className="truncate">{tab.title}</span>
                </div>
                {tab.id !== 'roadmap' && (
                    <button 
                       onClick={(e) => closeTab(e, tab.id)}
                       className={`shrink-0 rounded-full p-1 transition-colors ${activeTabId === tab.id ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'opacity-0 group-hover:opacity-100 text-slate-500 hover:bg-slate-800'}`}
                    >
                        <X size={12} />
                    </button>
                )}
                {/* Active indicator line */}
                {activeTabId === tab.id && (
                   <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-vscode-accent to-purple-500 rounded-t-full"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Main workspace */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-[#0e111a]">
            {activeTab?.type === "roadmap" ? (
              <div className="p-4 lg:p-8 max-w-5xl mx-auto animate-[fade-in-up_0.4s_ease-out_forwards]"><RoadmapView topic={topic} /></div>
            ) : null}
            {activeTab?.type === "blog" && activeTab.chapter ? (
              <div className="p-4 lg:p-8 animate-[fade-in-up_0.4s_ease-out_forwards]">
                  <BlogView
                    chapter={activeTab.chapter}
                    roadmapMeta={roadmapList}
                    topicName={topic.topic_name}
                    level={topic.level}
                    user={user}
                    topicId={topic_id}
                    onNotesChange={() => setNotesVersion((v) => v + 1)}
                    onOpenNotes={() => {
                      setShowNotesPanel(true);
                      setNotesVersion((v) => v + 1);
                    }}
                    hasPrev={activeTab.index > 0}
                    hasNext={activeTab.index < sortedChapters.length - 1}
                    onPrev={() => {
                      const i = activeTab.index - 1;
                      showChapter(sortedChapters[i], i);
                    }}
                    onNext={() => {
                      const i = activeTab.index + 1;
                      showChapter(sortedChapters[i], i);
                    }}
                    onTakeQuiz={() => {
                      const qz = quizByChapter[activeTab.chapter.chapter_number];
                      if (qz) showQuiz(qz);
                    }}
                  />
              </div>
            ) : null}
            {activeTab?.type === "quiz" && activeTab.quiz ? (
              <div className="p-4 lg:p-8 h-full animate-[fade-in-up_0.4s_ease-out_forwards]">
                  <QuizView
                    quiz={activeTab.quiz}
                    chapterNumber={activeTab.quiz.chapter_number}
                    onRefresh={refresh}
                    onContinue={() => {
                      setTabs((t) => t.filter((x) => x.id !== activeTab.id));
                      setActiveTabId("roadmap");
                    }}
                  />
              </div>
            ) : null}
            {activeTab?.type === "results" ? (
              <div className="p-4 lg:p-8 animate-[fade-in-up_0.4s_ease-out_forwards]">
                  <ResultView
                    topicId={topic_id}
                    topicName={topic.topic_name}
                    onClose={() => {
                      setTabs((t) => t.filter((x) => x.id !== "results"));
                      setActiveTabId("roadmap");
                    }}
                  />
              </div>
            ) : null}
          </div>
        </section>

        {/* Notes Panel Component Drop-in */}
        {showNotesPanel && (
          <NotesPanel
            user={user}
            topicId={topic_id}
            isOpen={showNotesPanel}
            reload={notesVersion}
            onClose={() => setShowNotesPanel(false)}
          />
        )}

        {/* ChatBot Sidebar (Desktop) */}
        <div className="hidden xl:block w-[320px] shrink-0 border-l border-slate-800/80 bg-slate-950/95 relative z-20">
          <ChatBot topicName={topic.topic_name} context={chatContext} />
        </div>

        {/* Mobile Floating Chatbot Toggle */}
        <button
           onClick={() => setShowMobileChat(true)}
           className="xl:hidden fixed bottom-6 right-6 z-30 p-4 rounded-full bg-vscode-accent text-white shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:scale-110 active:scale-95 transition-transform animate-[fade-in-up_0.3s_ease-out_forwards]"
        >
           <MessageCircle size={28} />
        </button>

        {/* Mobile Chat Overlay */}
        {showMobileChat && (
          <div className="fixed xl:hidden inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out_forwards]">
             <div className="w-full sm:w-[400px] h-[85vh] sm:h-[600px] max-h-full rounded-t-3xl sm:rounded-[2rem] overflow-hidden animate-[slide-in-right_0.3s_ease-out_forwards] border border-slate-700/80 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <ChatBot 
                  topicName={topic.topic_name} 
                  context={chatContext} 
                  isMobileOverlay={true}
                  onClose={() => setShowMobileChat(false)} 
                />
             </div>
             {/* Tap backdrop to close */}
             <div className="absolute inset-0 -z-10" onClick={() => setShowMobileChat(false)}></div>
          </div>
        )}
      </div>

      {/* Prep Mode Modal */}
      {showPrepMode && (
        <PrepMode
          topicId={topic_id}
          topicName={topic.topic_name}
          userId={user?.id}
          onStartExam={(exam) => {
            setShowPrepMode(false);
            if (exam) {
              navigate(`/learn/${topic_id}/exam/${exam._id}`, {
                state: { exam, topicName: topic.topic_name },
              });
            }
          }}
        />
      )}
    </div>
  );
}
