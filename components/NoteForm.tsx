import React, { useState, useEffect } from 'react';
import { Note } from '../types';

interface NoteFormProps {
  onClose: () => void;
  onSave: (title: string, content: string) => void;
  initialData?: Note;
}

export const NoteForm: React.FC<NoteFormProps> = ({ onClose, onSave, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSave(title, content);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative bg-zinc-950 w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit} className="flex flex-col h-[80vh] max-h-[600px]">
          <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/50">
            <h2 className="text-xl font-bold text-white">
              {initialData ? 'Edit Note' : 'Create Note'}
            </h2>
            <button 
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                Note Title
              </label>
              <input
                id="title"
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Giving it a name..."
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-semibold text-white placeholder:text-zinc-700 transition-all"
                required
              />
            </div>
            
            <div className="flex flex-col flex-grow">
              <label htmlFor="content" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts here..."
                className="w-full h-full min-h-[250px] px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none leading-relaxed text-white placeholder:text-zinc-700 transition-all"
                required
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 text-xs italic">
              <i className="fas fa-magic text-indigo-400"></i>
              <span>Gemini will auto-tag your note</span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-zinc-400 font-semibold hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition-all active:scale-95"
              >
                Save Note
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};