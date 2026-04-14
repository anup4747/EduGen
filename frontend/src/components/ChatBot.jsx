import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Bot, User, Sparkles, Loader2, X } from "lucide-react";

function getSocketUrl() {
  const env = import.meta.env.VITE_SOCKET_URL;
  if (env) return env;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export default function ChatBot({ topicName, context, onClose, isMobileOverlay }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [socketReady, setSocketReady] = useState(false);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `Hi! I am your AI learning assistant for **${topicName || "this topic"}**. Ask me anything about what you are studying!`,
        streaming: false,
      },
    ]);
  }, [topicName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const url = getSocketUrl();
    const socket = io(url, {
      path: "/socket.io",
      transports: ["polling"],
      autoConnect: true,
    });
    socketRef.current = socket;

    const onConnect = () => setSocketReady(true);
    const onDisconnect = () => setSocketReady(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) setSocketReady(true);

    const onDelta = ({ text }) => {
      if (text == null || text === "") return;
      setMessages((m) => {
        const next = [...m];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && last?.streaming) {
          next[next.length - 1] = {
            ...last,
            content: last.content + text,
          };
        }
        return next;
      });
    };

    const onDone = () => {
      setMessages((m) => {
        const next = [...m];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && last?.streaming) {
          next[next.length - 1] = { ...last, streaming: false };
        }
        return next;
      });
      setLoading(false);
    };

    const onErr = ({ error: err }) => {
      setError(err || "Chat failed");
      setMessages((m) => {
        const next = [...m];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && last?.streaming) {
          next[next.length - 1] = {
            role: "assistant",
            content:
              last.content ||
              "Sorry, I could not complete that reply. Try again.",
            streaming: false,
          };
        }
        return next;
      });
      setLoading(false);
    };

    socket.on("chat_delta", onDelta);
    socket.on("chat_done", onDone);
    socket.on("chat_error", onErr);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat_delta", onDelta);
      socket.off("chat_done", onDone);
      socket.off("chat_error", onErr);
      socket.disconnect();
      socketRef.current = null;
      setSocketReady(false);
    };
  }, []);

  function handleSend() {
    const text = input.trim();
    const socket = socketRef.current;
    if (!text || loading || !socket?.connected) return;
    setError("");
    setInput("");

    const history = messages
      .filter((m) => !m.streaming)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((m) => [
      ...m,
      { role: "user", content: text, streaming: false },
      { role: "assistant", content: "", streaming: true },
    ]);
    setLoading(true);

    socket.emit("chat_stream", {
      topic: topicName || "",
      context: context || "",
      conversation_history: history,
      message: text,
    });
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={`flex h-full min-h-0 flex-col bg-[#080b12] ${isMobileOverlay ? 'shadow-[-20px_0_80px_rgba(0,0,0,0.8)]' : ''}`}>
      {/* Header */}
      <div className="shrink-0 border-b border-slate-800/80 p-4 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-vscode-accent/10 text-vscode-accent border border-vscode-accent/20">
               <Sparkles size={20} />
             </div>
             <div>
                <h3 className="text-sm font-bold text-white tracking-wide">AI Tutor</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className={`w-2 h-2 rounded-full ${socketReady ? 'bg-emerald-500 shadow-[0_0_8px_theme(colors.emerald.500)]' : 'bg-rose-500'}`}></div>
                   <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest leading-none">
                     {socketReady ? 'Online' : 'Connecting...'}
                   </p>
                </div>
             </div>
           </div>
           {isMobileOverlay && (
             <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <X size={20} />
             </button>
           )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 custom-scrollbar bg-slate-950/30">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-[fade-in-up_0.2s_ease-out_forwards] ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 ring-1 ring-slate-700 flex items-center justify-center text-vscode-accent mt-1 overflow-hidden">
                <Bot size={16} />
              </div>
            )}
            
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-md ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-vscode-accent to-purple-600 text-white rounded-tr-sm"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                msg.streaming ? (
                  <div className="whitespace-pre-wrap font-sans leading-relaxed flex items-center gap-2">
                    {msg.content}
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-vscode-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-vscode-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-vscode-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-a:text-vscode-accent whitespace-pre-wrap">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content || "…"}
                    </ReactMarkdown>
                  </div>
                )
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}
            </div>
            
            {msg.role === "user" && (
              <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 ring-1 ring-slate-700 flex items-center justify-center text-slate-400 mt-1 overflow-hidden border border-slate-700">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        {error ? (
          <div className="flex justify-center">
            <p className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-medium">
               {error}
            </p>
          </div>
        ) : null}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-slate-800/80 p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={socketReady ? "Ask anything..." : "Connecting..."}
            disabled={!socketReady}
            className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-900 py-3.5 pl-4 pr-14 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-vscode-accent focus:bg-slate-900 focus:ring-4 focus:ring-vscode-accent/10 disabled:opacity-50"
            style={{ minHeight: "52px", maxHeight: "120px" }}
          />
          <button
            type="button"
            disabled={loading || !input.trim() || !socketReady}
            onClick={handleSend}
            className="absolute right-2 top-[7px] p-2 rounded-xl bg-vscode-accent text-white font-medium transition hover:bg-purple-500 disabled:opacity-40 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none shadow-[0_0_15px_rgba(124,58,237,0.4)]"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
          </button>
        </div>
        <p className="text-center text-[10px] uppercase font-bold tracking-widest text-slate-600 mt-3">
          AI can make mistakes
        </p>
      </div>
    </div>
  );
}
