import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Brain } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signErr) throw signErr;
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#080b12] px-4 py-10 overflow-hidden font-['Inter'] selection:bg-vscode-accent selection:text-white">
      {/* Animated Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-vscode-accent/20 rounded-full blur-[120px] animate-float1 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-float2 pointer-events-none"></div>

      <div 
        className={`relative z-10 w-full max-w-md rounded-[2rem] bg-slate-950/80 backdrop-blur-xl p-10 shadow-[0_0_50px_rgba(124,58,237,0.15)] ring-1 ring-slate-800 transition-all duration-700 transform ${
          isVisible ? "opacity-100 translate-y-0 shadow-[0_24px_80px_rgba(0,0,0,0.5)]" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="mb-8 text-center flex flex-col items-center">
          <Link to="/" className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-vscode-accent to-purple-600 shadow-[0_0_20px_rgba(124,58,237,0.3)] mb-6 hover:scale-105 transition-transform">
             <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center p-[2px]">
                <div className="w-full h-full rounded-2xl bg-vscode-accent/20 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-vscode-accent" />
                </div>
             </div>
          </Link>
          <p className="text-xs uppercase tracking-[0.28em] text-vscode-accent font-semibold mb-2">
            EduGen AI
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400 font-medium">
            Sign in to continue your personalized learning journey.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 group">
            <label className="block text-sm font-semibold text-white/90 transition-colors group-focus-within:text-vscode-accent">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/50 px-4 py-3.5 text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-vscode-accent focus:bg-slate-900 focus:ring-4 focus:ring-vscode-accent/10 hover:border-slate-600"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2 group">
            <label className="block text-sm font-semibold text-white/90 transition-colors group-focus-within:text-vscode-accent">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/50 px-4 py-3.5 text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-vscode-accent focus:bg-slate-900 focus:ring-4 focus:ring-vscode-accent/10 hover:border-slate-600"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error ? (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3">
                  <p className="text-sm font-medium text-rose-400 text-center">{error}</p>
              </div>
          ) : null}
          <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden w-full rounded-full bg-gradient-to-r from-vscode-accent to-purple-600 px-5 py-4 text-sm font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer"></div>
                <span className="relative">
                   {loading ? "Signing in…" : "Sign In to EduGen"}
                </span>
              </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm font-medium text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-bold text-vscode-accent hover:text-white transition-colors"
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
