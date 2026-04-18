import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  getUserAnalytics,
  getUserTopics,
  getProfile,
  updateProfile,
  uploadProfilePicture,
} from "../api/learnpath";
import {
  User,
  CheckCircle2,
  Clock,
  BookOpen,
  Settings,
  X,
  Edit2,
  Save,
  ArrowLeft,
  Camera,
  Shield,
} from "lucide-react";

function levelBadgeClass(level) {
  if (level === "Beginner")
    return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
  if (level === "Intermediate")
    return "bg-amber-500/10 border-amber-500/20 text-amber-400";
  return "bg-rose-500/10 border-rose-500/20 text-rose-400";
}

function renderInitials(name, username) {
  const source = name || username || "Learner";
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function Profile({ user }) {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarData, setAvatarData] = useState("");
  const [mongoProfile, setMongoProfile] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);

  useEffect(() => {
    if (!user) return;
    const metadata = user.user_metadata || {};
    setFullName(metadata.full_name || "");
    setUsername(metadata.username || "");
    setBio(metadata.bio || "");
    setAvatarUrl(metadata.avatar_url || "");
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;

    (async () => {
      try {
        const profile = await getProfile(user.id);
        if (cancelled || !profile) return;
        setMongoProfile(profile);
        setFullName(profile.full_name || user.user_metadata?.full_name || "");
        setUsername(profile.username || user.user_metadata?.username || "");
        setBio(profile.bio || user.user_metadata?.bio || "");
        setAvatarUrl(
          profile.avatar_url || user.user_metadata?.avatar_url || "",
        );
        setAvatarData(profile.avatar_data || "");
      } catch (err) {
        console.warn("Could not load backend profile", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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
            e.response?.data?.error ||
              e.message ||
              "Failed to load profile data",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;

    (async () => {
      try {
        const analytics = await getUserAnalytics(user.id);
        if (!cancelled) setUserAnalytics(analytics);
      } catch (err) {
        console.warn("Could not load user analytics", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function handleSaveProfile(event) {
    event.preventDefault();
    setFormError("");
    setSuccess("");
    setSaving(true);

    try {
      let finalAvatarUrl = avatarUrl;

      // 1. Upload to Supabase if a new file is selected
      if (avatarFile) {
        try {
          const uploadRes = await uploadProfilePicture(user.id, avatarFile);
          if (uploadRes.success && uploadRes.profile_url) {
            finalAvatarUrl = uploadRes.profile_url;
            setAvatarUrl(finalAvatarUrl);
            setAvatarData(""); // Clear base64 data as we now have a URL
            setAvatarFile(null); // Clear file as it's uploaded
          }
        } catch (uploadErr) {
          console.error("Image upload failed", uploadErr);
          throw new Error("Failed to upload image to storage.");
        }
      }

      // 2. Update other profile fields in MongoDB
      const profileResponse = await updateProfile(
        user.id,
        fullName,
        username,
        bio,
        undefined, // avatarData is now handled by the upload route (cleared)
        finalAvatarUrl,
      );

      if (profileResponse?.profile) {
        setMongoProfile(profileResponse.profile);
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          username,
          bio,
          avatar_url: finalAvatarUrl,
        },
      });
      if (updateError) throw updateError;

      setSuccess("Profile updated successfully.");
      setTimeout(() => setIsEditing(false), 1500);
    } catch (err) {
      setFormError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  const profileHandle =
    username ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "learner";
  const displayName =
    fullName || user?.user_metadata?.full_name || user?.email || "Learner";
  const bioText =
    bio || user?.user_metadata?.bio || "Learning and growing every day.";
  const profileImage =
    avatarData || avatarUrl || user?.user_metadata?.avatar_url || "";
  const completedTopics = topics.filter((t) => t.completed).length;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-[#080b12] text-white font-['Inter'] selection:bg-vscode-accent selection:text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-vscode-accent/20 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 lg:px-10 lg:py-12 z-10 custom-scrollbar overflow-y-auto">
        {/* Header / Nav */}
        <div className="flex items-center justify-between mb-8 animate-[fade-in-up_0.4s_ease-out_forwards]">
          <button
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <div className="p-2 rounded-full bg-slate-900 group-hover:bg-slate-800 transition-colors">
              <ArrowLeft size={16} />
            </div>
            Back to Dashboard
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 border border-slate-700/80 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:border-slate-600 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]"
          >
            <Settings size={16} className="text-vscode-accent" /> Account
            Settings
          </button>
        </div>

        <div className="space-y-8 pb-12">
          {/* Profile Hero Card */}
          <section className="relative rounded-[2.5rem] bg-slate-950/60 p-8 lg:p-10 ring-1 ring-slate-800/80 shadow-2xl backdrop-blur-xl overflow-hidden animate-[fade-in-up_0.5s_ease-out_forwards] border border-slate-800/50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-vscode-accent/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center">
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-vscode-accent to-purple-600 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-4xl font-bold text-white border-2 border-slate-800 shadow-xl">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{renderInitials(displayName, profileHandle)}</span>
                  )}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-0 right-0 p-2.5 bg-vscode-accent rounded-full text-white shadow-lg border-2 border-[#080b12] hover:scale-110 transition-transform"
                >
                  <Edit2 size={14} />
                </button>
              </div>

              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.28em] text-vscode-accent font-bold mb-2">
                  Learner Profile
                </p>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                  {displayName}
                </h1>
                <p className="text-lg text-slate-400 font-medium font-mono mb-4">
                  @{profileHandle}
                </p>
                <p className="max-w-2xl text-base leading-relaxed text-slate-300 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                  {bioText}
                </p>
              </div>
            </div>
          </section>

          {/* Bento Grid Stats */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[2rem] bg-slate-900/40 p-6 ring-1 ring-slate-800 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_25px_rgba(124,58,237,0.15)] hover:bg-slate-900/60 animate-[fade-in-up_0.6s_ease-out_forwards] border-t border-t-slate-800/80">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
                  <BookOpen size={20} />
                </div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold text-slate-400">
                  Total Topics
                </p>
              </div>
              <p className="text-4xl font-bold text-white tracking-tight">
                {topics.length}
              </p>
            </div>

            <div className="rounded-[2rem] bg-slate-900/40 p-6 ring-1 ring-slate-800 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:bg-slate-900/60 animate-[fade-in-up_0.7s_ease-out_forwards] border-t border-t-slate-800/80">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold text-slate-400">
                  Completed
                </p>
              </div>
              <p className="text-4xl font-bold text-white tracking-tight">
                {completedTopics}
              </p>
            </div>

            <div className="rounded-[2rem] bg-slate-900/40 p-6 ring-1 ring-slate-800 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:bg-slate-900/60 animate-[fade-in-up_0.8s_ease-out_forwards] border-t border-t-slate-800/80">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400">
                  <User size={20} />
                </div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold text-slate-400">
                  Best Streak
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-bold text-white tracking-tight">
                  {userAnalytics?.best_streak ?? 0}
                </p>
                <span className="text-sm font-medium text-slate-400 mb-1">
                  days
                </span>
              </div>
            </div>

            <div className="rounded-[2rem] bg-slate-900/40 p-6 ring-1 ring-slate-800 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_25px_rgba(14,165,233,0.15)] hover:bg-slate-900/60 animate-[fade-in-up_0.9s_ease-out_forwards] border-t border-t-slate-800/80">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400">
                  <Clock size={20} />
                </div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold text-slate-400">
                  Study Time
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-bold text-white tracking-tight">
                  {userAnalytics?.total_time
                    ? Math.floor(userAnalytics.total_time / 60)
                    : 0}
                </p>
                <span className="text-sm font-medium text-slate-400 mb-1">
                  mins
                </span>
              </div>
            </div>
          </section>

          {/* Topics Progress Feed */}
          <section className="rounded-[2.5rem] bg-slate-950/60 p-8 lg:p-10 ring-1 ring-slate-800/80 shadow-xl backdrop-blur-sm animate-[fade-in-up_1s_ease-out_forwards]">
            <div className="mb-8 flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Path History
                </h2>
                <p className="text-sm font-medium text-slate-400 mt-1">
                  Review your generated knowledge bases
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-slate-900/40 rounded-3xl animate-pulse"
                  ></div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-5 text-rose-400 text-sm font-medium">
                {error}
              </div>
            ) : topics.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 bg-slate-900/30 rounded-3xl border border-slate-800/50 border-dashed">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 text-slate-500">
                  <BookOpen size={24} />
                </div>
                <p className="text-slate-400 font-medium">
                  No learning paths found yet.
                </p>
                <Link
                  to="/new-topic"
                  className="mt-4 text-vscode-accent font-bold hover:text-white transition-colors"
                >
                  Start your first course →
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {topics.map((topic) => (
                  <div
                    key={topic._id}
                    className="group rounded-3xl bg-slate-900/50 p-6 border border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 transition-all duration-300"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-lg font-bold text-white group-hover:text-vscode-accent transition-colors leading-tight">
                          {topic.topic_name}
                        </h3>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-[10px] uppercase font-bold border ${levelBadgeClass(topic.level)}`}
                        >
                          {topic.level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2 pt-4 border-t border-slate-800/50">
                        <div className="flex items-center gap-2 text-slate-400 font-medium text-xs">
                          <Clock size={14} />
                          {topic.created_at
                            ? new Date(topic.created_at).toLocaleDateString()
                            : ""}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${topic.completed ? "text-emerald-400" : "text-slate-500"}`}
                          >
                            {topic.completed ? "Done" : "Active"}
                          </span>
                          <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded-lg text-slate-300">
                            Score: {topic.total_score ?? 0}/
                            {topic.max_score ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Slide-over Settings Drawer Area */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isEditing ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsEditing(false)}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#080b12] border-l border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.8)] custom-scrollbar overflow-y-auto flex flex-col transform transition-transform duration-300 ease-in-out ${isEditing ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 bg-[#080b12]/80 backdrop-blur-md border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">Edit Profile</h3>
            <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">
              Account Settings
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSaveProfile} className="p-8 space-y-6 flex-1">
          {/* Photo Upload Area */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed mb-8">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-500 overflow-hidden relative group">
              {avatarData || avatarUrl || profileImage ? (
                <img
                  src={avatarData || avatarUrl || profileImage}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={32} />
              )}
              <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all cursor-pointer">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            <span className="text-sm font-bold text-white mb-2">
              Profile Picture
            </span>
            <div className="w-full relative group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!file.type.startsWith("image/")) {
                    setFormError("Please upload a valid image file.");
                    return;
                  }
                  if (file.size > 1024 * 1024) {
                    setFormError("Avatar file must be 1MB or smaller.");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === "string") {
                      setAvatarData(reader.result);
                      setAvatarUrl("");
                      setAvatarFile(file);
                      setFormError("");
                    }
                  };
                  reader.readAsDataURL(file);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-center text-xs font-bold text-white group-hover:bg-slate-800 transition-colors">
                Choose Image File
              </div>
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="block text-sm font-bold text-white/90 group-focus-within:text-vscode-accent transition-colors">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/50 px-4 py-3.5 text-slate-100 outline-none transition-all focus:border-vscode-accent focus:bg-slate-900 focus:ring-4 focus:ring-vscode-accent/10"
            />
          </div>

          <div className="space-y-2 group">
            <label className="block text-sm font-bold text-white/90 group-focus-within:text-vscode-accent transition-colors">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/50 px-4 py-3.5 text-slate-100 outline-none transition-all focus:border-vscode-accent focus:bg-slate-900 focus:ring-4 focus:ring-vscode-accent/10"
            />
          </div>

          <div className="space-y-2 group">
            <label className="block text-sm font-bold text-white/90 group-focus-within:text-vscode-accent transition-colors">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-2xl border border-slate-700/80 bg-slate-900/50 px-4 py-3.5 text-slate-100 outline-none transition-all focus:border-vscode-accent focus:bg-slate-900 focus:ring-4 focus:ring-vscode-accent/10 custom-scrollbar"
              placeholder="Tell us about your learning goals..."
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-500">
              <Shield size={14} /> Connected Email (Read-only)
            </label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full cursor-not-allowed rounded-2xl border border-slate-800 bg-slate-900/30 px-4 py-3 text-slate-500 outline-none"
            />
          </div>

          {formError && (
            <div className="rounded-xl bg-rose-500/10 p-3 border border-rose-500/20">
              <p className="text-sm font-medium text-rose-400 text-center">
                {formError}
              </p>
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/20">
              <p className="text-sm font-medium text-emerald-400 text-center">
                {success}
              </p>
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={saving}
              className="group relative overflow-hidden flex items-center justify-center gap-2 w-full rounded-full bg-vscode-accent px-5 py-4 text-sm font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-50"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <Save size={16} className="relative z-10" />
              <span className="relative z-10">
                {saving ? "Saving Changes…" : "Save Profile"}
              </span>
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
