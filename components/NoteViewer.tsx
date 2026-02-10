import React, { useEffect, useState } from 'react';
import { Note } from '../types';

interface NoteViewerProps {
  note: Note;
  onClose: () => void;
  onEdit: () => void;
  onSummarize: () => Promise<void>;
}

export const NoteViewer: React.FC<NoteViewerProps> = ({ note, onClose, onEdit, onSummarize }) => {
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSummarizeClick = async () => {
    setIsSummarizing(true);
    try {
      await onSummarize();
    } finally {
      setIsSummarizing(false);
    }
  };

  const dateStr = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative bg-zinc-950 w-full max-w-2xl rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/50">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 font-medium">{dateStr}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onEdit}
              className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              title="Edit Note"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              title="Close"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-8 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
            {note.title}
          </h1>

          {/* AI Summary Section */}
          <div className="mb-8">
            {note.summary ? (
              <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-3 text-indigo-400">
                  <i className="fas fa-sparkles text-sm"></i>
                  <span className="text-xs font-bold uppercase tracking-widest">AI Summary</span>
                </div>
                <p className="text-indigo-100 text-lg leading-relaxed italic">
                  "{note.summary}"
                </p>
              </div>
            ) : (
              <button
                onClick={handleSummarizeClick}
                disabled={isSummarizing}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${isSummarizing ? 'border-zinc-800 bg-zinc-900 text-zinc-500 cursor-not-allowed' : 'border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 transition-all active:scale-95'}`}
              >
                {isSummarizing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span className="text-sm font-bold uppercase tracking-widest">Generating...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i>
                    <span className="text-sm font-bold uppercase tracking-widest">Summarize Note</span>
                  </>
                )}
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {note.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-full text-xs font-bold uppercase tracking-wider">
                #{tag}
              </span>
            ))}
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="flex items-center gap-2 mb-4 text-zinc-500">
               <i className="fas fa-align-left text-xs"></i>
               <span className="text-[10px] font-bold uppercase tracking-widest">Full Content</span>
            </div>
            <p className="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap">
              {note.content}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-900 text-center">
            <button 
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
            >
              Close Reader
            </button>
        </div>
      </div>
    </div>
  );
};