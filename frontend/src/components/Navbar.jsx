import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, User, MessageCircle, BrainCircuit } from "lucide-react";

function initials(name, fallback) {
  if (name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }
  return fallback?.slice(0, 2).toUpperCase() || "UE";
}

export default function Navbar({
  userEmail,
  userName,
  userAvatar,
  onLogout,
  onFeedback,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const displayTitle = userName || userEmail || "Learner";
  const fallbackText = userEmail && userName ? userEmail : "";

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between bg-slate-950/80 backdrop-blur-md px-6 border-b border-slate-800/80 sticky top-0 z-50">
      <Link
        to="/dashboard"
        className="group flex items-center gap-3 rounded-full hover:bg-slate-900/50 px-2 py-1 transition-colors"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-white shadow-xl group-hover:bg-slate-800 group-hover:border-vscode-accent/50 transition-all">
          <BrainCircuit size={20} className="text-vscode-accent" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-white tracking-tight">EduGen AI</p>
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Workspace</p>
        </div>
      </Link>

      <div className="relative flex items-center gap-3" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="flex items-center gap-3 rounded-full bg-slate-900/50 p-1 pr-1 sm:pr-4 text-left transition hover:bg-slate-800 ring-1 ring-slate-800/80 hover:ring-slate-700 active:scale-95"
        >
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-xs font-bold text-white shadow-md">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              initials(userName, userEmail)
            )}
          </div>
          {/* Text wrapper hidden on small screens */}
          <div className="hidden sm:block min-w-0 pr-1 max-w-[120px]">
            <p className="text-sm font-bold text-white truncate">
              {displayTitle}
            </p>
            {fallbackText ? (
              <p className="text-[10px] font-medium text-slate-400 truncate">
                {fallbackText}
              </p>
            ) : null}
          </div>
        </button>

        {menuOpen ? (
          <div className="absolute right-0 top-full z-20 mt-3 w-56 overflow-hidden rounded-[1.5rem] border border-slate-700 bg-slate-900 p-1.5 shadow-[0_0_40px_rgba(0,0,0,0.5)] animate-[fade-in-up_0.15s_ease-out_forwards]">
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <User size={16} />
              Profile
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onFeedback();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <MessageCircle size={16} />
              Feedback
            </button>
            <div className="my-1 h-px w-full bg-slate-800" />
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-400 transition hover:bg-rose-500/10"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
