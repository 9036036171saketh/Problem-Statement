
import React from 'react';
import { ViewType } from '../types';

interface HeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="sticky top-0 z-40 glass border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('active')}>
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/50">
                <i className="fas fa-brain text-white text-xl"></i>
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Lumina
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
              <button 
                onClick={() => onViewChange('active')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${currentView === 'active' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Notes
              </button>
              <button 
                onClick={() => onViewChange('archived')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${currentView === 'archived' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Archive
              </button>
              <button 
                onClick={() => onViewChange('trash')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${currentView === 'trash' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Trash
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 mr-2">
              <button 
                onClick={() => onViewChange('trash')}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${currentView === 'trash' ? 'bg-indigo-600/20 text-indigo-400' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}
                title="View Trash"
              >
                <i className="fas fa-trash-can"></i>
              </button>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-700 shadow-sm overflow-hidden">
               <img src="https://picsum.photos/seed/user/32/32" alt="avatar" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};