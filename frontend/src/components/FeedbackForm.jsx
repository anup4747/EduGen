import { useState } from "react";
import axios from "axios";
import { MessageSquare, Send, Star, X, CheckCircle2 } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:5000/api";

const FEEDBACK_TYPES = [
  { id: "general", label: "General Feedback" },
  { id: "bug", label: "Bug Report" },
  { id: "feature", label: "Feature Request" },
  { id: "content", label: "Content Issue" },
  { id: "ui", label: "UI/UX Issue" },
];

export default function FeedbackForm({ user, onClose }) {
  const [formData, setFormData] = useState({
    name: user?.email?.split("@")[0] || "",
    email: user?.email || "",
    rating: 5,
    feedback_type: "general",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/feedback`, {
        user_id: user?.id || null,
        ...formData,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose && onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-[fade-in-up_0.3s_ease-out_forwards]">
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight mb-3">Thank you!</h3>
        <p className="text-slate-400 font-medium max-w-[280px]">Your feedback is crucial and helps us improve LearnerPath AI every single day.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-2">
      <div className="flex items-center gap-4 mb-8">
         <div className="p-3 bg-vscode-accent/10 text-vscode-accent border border-vscode-accent/20 rounded-2xl">
             <MessageSquare size={24} />
         </div>
         <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Share Feedback</h2>
            <p className="text-sm font-medium text-slate-400 mt-1">Help us build the perfect learning experience.</p>
         </div>
         {onClose && (
            <button onClick={onClose} className="ml-auto p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                 <X size={20} />
            </button>
         )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2 group">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 group-focus-within:text-vscode-accent transition-colors">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/50 px-4 py-3.5 text-slate-100 outline-none transition-all focus:border-vscode-accent focus:bg-slate-900 focus:ring-4 focus:ring-vscode-accent/10"
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2 group">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 group-focus-within:text-vscode-accent transition-colors">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/50 px-4 py-3.5 text-slate-100 outline-none transition-all focus:border-vscode-accent focus:bg-slate-900 focus:ring-4 focus:ring-vscode-accent/10"
              placeholder="hello@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">
            Overall Experience *
          </label>
          <div className="flex items-center gap-2 bg-slate-900/50 p-4 rounded-3xl border border-slate-800 w-fit">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                className={`transition-all duration-200 hover:scale-110 p-1.5 rounded-full ${
                  star <= formData.rating ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-slate-700 hover:text-slate-500 hover:bg-slate-800"
                }`}
              >
                <div className="relative">
                   <Star size={26} fill={star <= formData.rating ? "currentColor" : "none"} strokeWidth={star <= formData.rating ? 0 : 2} />
                </div>
              </button>
            ))}
            <div className="h-8 w-px bg-slate-800 mx-2"></div>
            <span className="text-sm font-bold text-slate-300 w-24 text-center">
              {['Poor', 'Fair', 'Good', 'Great', 'Exceptional'][formData.rating - 1]}
            </span>
          </div>
        </div>

        <div className="space-y-2 group">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 group-focus-within:text-vscode-accent transition-colors">
            What is this regarding? *
          </label>
          <select
            name="feedback_type"
            value={formData.feedback_type}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/50 px-4 py-3.5 text-slate-100 outline-none transition-all focus:border-vscode-accent focus:bg-slate-900 focus:ring-4 focus:ring-vscode-accent/10 appearance-none cursor-pointer"
            required
          >
            {FEEDBACK_TYPES.map((type) => (
              <option key={type.id} value={type.id} className="bg-slate-900">
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 group">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 group-focus-within:text-vscode-accent transition-colors">
            Detailed Feedback *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full resize-none rounded-2xl border border-slate-700/80 bg-slate-900/50 px-4 py-3.5 text-slate-100 outline-none transition-all focus:border-vscode-accent focus:bg-slate-900 focus:ring-4 focus:ring-vscode-accent/10 custom-scrollbar"
            placeholder="Tell us everything..."
            required
          />
        </div>

        {error && (
          <div className="animate-[fade-in_0.2s_ease-out_forwards] rounded-xl bg-rose-500/10 p-3 border border-rose-500/20">
             <p className="text-sm font-medium text-rose-400 text-center">{error}</p>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="group relative overflow-hidden flex items-center justify-center gap-2 w-full rounded-2xl bg-vscode-accent px-5 py-4 text-sm font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-50"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <Send size={16} className="relative z-10" />
            <span className="relative z-10">{loading ? "Sending..." : "Submit Feedback"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}