import React from 'react';
import { SearchMode } from '../types';

interface SearchBarProps {
  query: string;
  onQueryChange: (val: string) => void;
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  query, 
  onQueryChange, 
  mode, 
  onModeChange,
  isLoading 
}) => {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {isLoading ? (
          <i className="fas fa-spinner fa-spin text-indigo-400"></i>
        ) : (
          <i className="fas fa-search text-zinc-500 group-focus-within:text-indigo-400 transition-colors"></i>
        )}
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={mode === SearchMode.SEMANTIC ? "Ask AI (e.g. 'Project budget ideas')..." : "Keyword search..."}
        className="block w-full pl-11 pr-36 py-3 border border-zinc-800 rounded-2xl leading-5 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm shadow-sm transition-all"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <div className="bg-black p-1 rounded-xl border border-zinc-800 flex gap-1">
          <button
            onClick={() => onModeChange(SearchMode.KEYWORD)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              mode === SearchMode.KEYWORD 
              ? 'bg-zinc-800 text-white shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => onModeChange(SearchMode.SEMANTIC)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              mode === SearchMode.SEMANTIC 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
              : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <i className="fas fa-sparkles text-[10px]"></i>
            AI Smart
          </button>
        </div>
      </div>
    </div>
  );
};