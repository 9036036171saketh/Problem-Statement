
import React from 'react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  onArchive?: () => void;
  onPermanentDelete?: () => void;
  relevanceReason?: string;
}

export const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onEdit, 
  onView, 
  onDelete, 
  onRestore, 
  onArchive, 
  onPermanentDelete,
  relevanceReason 
}) => {
  const dateStr = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const isTrash = note.isDeleted;
  const isArchive = note.isArchived && !note.isDeleted;

  return (
    <div 
      className="group bg-zinc-900/50 rounded-2xl border border-zinc-800 p-5 shadow-sm hover:shadow-2xl hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
    >
      {relevanceReason && (
        <div className="mb-3 px-3 py-2 bg-indigo-950/30 border border-indigo-900/50 rounded-lg text-xs text-indigo-300 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <i className="fas fa-magic mt-0.5"></i>
          <span>{relevanceReason}</span>
        </div>
      )}
      
      <div 
        className="cursor-pointer flex-grow"
        onClick={onView}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-white text-lg leading-tight line-clamp-1 group-hover:text-indigo-400 transition-colors">{note.title}</h3>
          <span className="text-xs text-zinc-500 whitespace-nowrap ml-2">{dateStr}</span>
        </div>
        
        <p className="text-zinc-300 text-sm mb-4 line-clamp-4 leading-relaxed">
          {note.content}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {note.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded text-[10px] font-bold uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div className="flex gap-1">
          {isTrash ? (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); onRestore?.(); }}
                className="p-2 text-zinc-500 hover:text-green-400 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Restore"
              >
                <i className="fas fa-arrow-rotate-left"></i>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onPermanentDelete?.(); }}
                className="p-2 text-zinc-500 hover:text-red-600 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Delete Permanently"
              >
                <i className="fas fa-trash-can"></i>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Edit"
              >
                <i className="fas fa-edit"></i>
              </button>
              {!isArchive && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onArchive?.(); }}
                  className="p-2 text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Archive"
                >
                  <i className="fas fa-archive"></i>
                </button>
              )}
              {isArchive && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onRestore?.(); }}
                  className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Unarchive"
                >
                  <i className="fas fa-upload"></i>
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Move to Trash"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </>
          )}
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-indigo-600 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-lg group/arrow"
          title="Open in Reader"
        >
            <i className="fas fa-chevron-right text-[12px] text-zinc-600 group-hover/arrow:text-white transition-colors"></i>
        </button>
      </div>
    </div>
  );
};