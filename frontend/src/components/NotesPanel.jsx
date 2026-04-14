import { useState, useEffect } from "react";
import { getUserNotes, updateNote, deleteNote } from "../api/learnpath";
import { X, Edit2, Trash2, Save, FileText } from "lucide-react";

const NotesPanel = ({ user, topicId, isOpen, reload, onClose }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (isOpen && user?.id) {
      loadNotes();
    }
  }, [isOpen, user?.id, topicId, reload]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const userNotes = await getUserNotes(user.id, topicId);
      setNotes(userNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setEditText(note.note_text);
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !editText.trim()) return;

    try {
      await updateNote(editingNote._id, editText);
      setEditingNote(null);
      setEditText("");
      loadNotes();
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await deleteNote(noteId);
      loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const highlightColors = {
    yellow: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    pink: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-slate-950/95 border-l border-slate-800/80 shadow-[-20px_0_60px_rgba(0,0,0,0.6)] z-50 flex flex-col animate-[slide-in-right_0.3s_ease-out_forwards] font-['Inter']">
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <FileText size={18} />
             </div>
             <h2 className="text-base font-bold text-white tracking-wide">Personal Notes</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#080b12]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
               <div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-amber-400 animate-spin"></div>
               <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading...</div>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-500 shadow-inner">
                 <FileText size={24} />
              </div>
              <p className="text-sm font-bold text-slate-300 mb-1">No notes yet</p>
              <p className="text-xs text-slate-500 max-w-[200px] mx-auto">Select any text while reading a chapter to create your first note.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note._id} className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 ring-1 ring-white/5 hover:bg-slate-900 hover:border-slate-700 transition duration-300">
                  <div className={`p-3 rounded-xl mb-4 border text-[13px] leading-snug italic font-medium ${highlightColors[note.highlight_color] || highlightColors.yellow}`}>
                    "{note.selected_text}"
                  </div>

                  {editingNote && editingNote._id === note._id ? (
                    <div className="space-y-3 animate-[fade-in_0.2s_ease-out_forwards]">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 resize-none shadow-inner custom-scrollbar"
                        rows={3}
                        placeholder="Write your note here..."
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setEditingNote(null);
                            setEditText("");
                          }}
                          className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-700 hover:text-white transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-amber-950 text-xs font-bold rounded-lg hover:bg-amber-400 transition shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        >
                          <Save size={14} /> Update
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-200 text-sm mb-4 leading-relaxed whitespace-pre-wrap">{note.note_text}</p>
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                        <span className="text-slate-500 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">Chapter {note.chapter_number}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(note)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(note._id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotesPanel;