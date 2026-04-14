import { useState, useRef, useEffect } from "react";
import { createNote, updateNote, deleteNote } from "../api/learnpath";
import { PenTool, Check, X, BookmarkPlus } from "lucide-react";

const TextSelector = ({
  children,
  user,
  topicId,
  chapterNumber,
  onNotesChange,
  onOpenNotes,
}) => {
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState(null);
  const [selectionBox, setSelectionBox] = useState(null);
  const [showAddButton, setShowAddButton] = useState(false);
  const [noteDraft, setNoteDraft] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [highlightColor, setHighlightColor] = useState("yellow");
  const [editingNote, setEditingNote] = useState(null);
  const containerRef = useRef(null);
  const addButtonRef = useRef(null);
  const modalRef = useRef(null);

  const clearSelection = () => {
    setSelectedText("");
    setSelectionRange(null);
    setSelectionBox(null);
    setShowAddButton(false);
    setShowNoteModal(false);
    window.getSelection().removeAllRanges();
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const text = selection.toString().trim();

      if (
        text.length > 0 &&
        containerRef.current.contains(range.commonAncestorContainer)
      ) {
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setSelectionRange(range);
        setSelectionBox({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        setShowAddButton(true);
        setNoteDraft(null);
        return;
      }
    }

    if (!showNoteModal) {
      clearSelection();
    }
  };

  const handleOpenNoteModal = () => {
    setNoteDraft({
      topicId,
      chapterNumber,
      selectedText,
      highlightColor,
    });
    setShowNoteModal(true);
    setShowAddButton(false);
  };

  const handleSaveNote = async () => {
    if (!noteDraft || !noteDraft.selectedText || !noteText.trim()) return;

    try {
      if (editingNote) {
        await updateNote(editingNote._id, noteText);
      } else {
        await createNote(
          user.id,
          noteDraft.topicId,
          noteDraft.chapterNumber,
          noteDraft.selectedText,
          noteText,
          highlightColor,
        );
      }

      onNotesChange && onNotesChange();
      onOpenNotes && onOpenNotes();
      setShowNoteModal(false);
      setNoteDraft(null);
      setNoteText("");
      setEditingNote(null);
      clearSelection();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleCancel = () => {
    setShowNoteModal(false);
    setNoteDraft(null);
    setNoteText("");
    setEditingNote(null);
    clearSelection();
  };

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!showAddButton || showNoteModal) return;
      if (
        addButtonRef.current?.contains(event.target) ||
        modalRef.current?.contains(event.target)
      ) {
        return;
      }
      const notesPanel = document.querySelector(".notes-panel-root");
      if (notesPanel?.contains(event.target)) return;
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        clearSelection();
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [showAddButton, showNoteModal]);

  const highlightColors = {
    yellow: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    pink: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  };

  const selectorColors = {
     yellow: "bg-amber-500",
     purple: "bg-purple-500",
     green: "bg-emerald-500",
     pink: "bg-rose-500"
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleTextSelection}
      className="relative"
    >
      {children}

      {/* Interactive Floater Tooltip */}
      {showAddButton && selectionBox && (
        <button
          type="button"
          ref={addButtonRef}
          onClick={handleOpenNoteModal}
          style={{
            position: "absolute",
            top: selectionBox.top - window.scrollY - 50,
            left: selectionBox.left - window.scrollX + (selectionBox.width / 2) - 60,
          }}
          className="fixed z-50 flex items-center justify-center gap-2 rounded-full border border-slate-700/50 bg-slate-900/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-slate-200 shadow-xl shadow-black/50 transition-all hover:bg-slate-800 hover:text-white hover:scale-105 active:scale-95 animate-[fade-in-up_0.15s_ease-out_forwards]"
        >
          <PenTool size={14} className="text-vscode-accent" />
          <span>Add Note</span>
        </button>
      )}

      {/* Note Creation Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease-out_forwards]">
          <div
            ref={modalRef}
            className="bg-slate-950/95 rounded-[2rem] p-7 max-w-md w-full border border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                   <BookmarkPlus size={20} />
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">
                  {editingNote ? "Edit Entry" : "New Note"}
                </h3>
            </div>

            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Selected Snippet</p>
              <div
                className={`p-4 rounded-xl border text-sm italic font-medium leading-relaxed ${highlightColors[highlightColor]}`}
              >
                "{selectedText}"
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2.5">
                Tag Color
              </label>
              <div className="flex gap-3">
                {Object.entries(selectorColors).map(([color, backgroundClass]) => (
                  <button
                    key={color}
                    onClick={() => setHighlightColor(color)}
                    className={`relative w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                      highlightColor === color
                        ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950 bg-slate-800 shadow-[0_0_15px_inherit]"
                        : "opacity-60 hover:opacity-100"
                    } ${backgroundClass}`}
                  >
                     {highlightColor === color && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2.5">
                Your Insights
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none shadow-inner custom-scrollbar transition-all"
                rows={4}
                placeholder="What are your thoughts on this snippet?"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800/80 pt-5">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-vscode-accent text-white font-bold text-xs rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 flex items-center gap-2"
              >
                {editingNote ? "Update Note" : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextSelector;
