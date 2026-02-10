
import React, { useState, useEffect, useMemo } from 'react';
import { Note, SearchMode, SearchResult, ViewType } from './types';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { NoteCard } from './components/NoteCard';
import { NoteForm } from './components/NoteForm';
import { NoteViewer } from './components/NoteViewer';
import { semanticSearch, generateTags, generateSummary } from './services/geminiService';

const STORAGE_KEY = 'lumina_notes_data';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load notes from localStorage", e);
      return [];
    }
  });

  const [currentView, setCurrentView] = useState<ViewType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>(SearchMode.KEYWORD);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [viewingNote, setViewingNote] = useState<Note | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error("Failed to save notes to localStorage", e);
    }
  }, [notes]);

  const handleSaveNote = async (title: string, content: string) => {
    let noteId: string;
    
    if (editingNote) {
      noteId = editingNote.id;
      setNotes(prev => prev.map(n => n.id === noteId ? {
        ...n,
        title,
        content,
        summary: undefined,
        updatedAt: Date.now()
      } : n));
    } else {
      noteId = generateId();
      const newNote: Note = {
        id: noteId,
        title,
        content,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isDeleted: false,
        isArchived: false
      };
      setNotes(prev => [newNote, ...prev]);
    }

    generateTags(title, content).then(tags => {
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, tags } : n));
      if (viewingNote?.id === noteId) {
        setViewingNote(prev => prev ? { ...prev, tags } : undefined);
      }
    }).catch(err => console.warn("Tag generation failed", err));

    setIsFormOpen(false);
    setEditingNote(undefined);
  };

  const handleSummarizeNote = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    try {
      const summary = await generateSummary(note.content);
      setNotes(prev => prev.map(n => n.id === id ? { ...n, summary } : n));
      if (viewingNote?.id === id) {
        setViewingNote(prev => prev ? { ...prev, summary } : undefined);
      }
    } catch (err) {
      console.error("Manual summarization failed", err);
    }
  };

  // SOFT DELETE (Move to trash)
  const handleTrashNote = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isDeleted: true, isArchived: false } : n));
    if (viewingNote?.id === id) setViewingNote(undefined);
  };

  // RESTORE
  const handleRestoreNote = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isDeleted: false, isArchived: false } : n));
  };

  // PERMANENT DELETE
  const handlePermanentDelete = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // ARCHIVE
  const handleArchiveNote = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isArchived: true, isDeleted: false } : n));
    if (viewingNote?.id === id) setViewingNote(undefined);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
    setViewingNote(undefined);
  };

  const handleViewNote = (note: Note) => {
    setViewingNote(note);
  };

  useEffect(() => {
    if (!searchQuery.trim() || searchMode === SearchMode.KEYWORD) {
      setSemanticResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await semanticSearch(searchQuery, notes);
        setSemanticResults(results);
      } catch (e) {
        console.error("Semantic search error", e);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchMode, notes]);

  const displayedNotes = useMemo(() => {
    // 1. Filter by view (Trash, Archive, Active)
    let baseNotes = notes.filter(n => {
      if (currentView === 'trash') return n.isDeleted;
      if (currentView === 'archived') return n.isArchived && !n.isDeleted;
      return !n.isDeleted && !n.isArchived;
    });

    if (!searchQuery.trim()) return baseNotes;

    // 2. Filter by search
    if (searchMode === SearchMode.KEYWORD) {
      const q = searchQuery.toLowerCase();
      return baseNotes.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.content.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      );
    } else {
      const resultIds = semanticResults.map(r => r.noteId);
      if (resultIds.length === 0 && !isSearching) return [];

      return baseNotes
        .filter(n => resultIds.includes(n.id))
        .sort((a, b) => {
          const scoreA = semanticResults.find(r => r.noteId === a.id)?.relevanceScore || 0;
          const scoreB = semanticResults.find(r => r.noteId === b.id)?.relevanceScore || 0;
          return scoreB - scoreA;
        });
    }
  }, [notes, searchQuery, searchMode, semanticResults, isSearching, currentView]);

  const viewTitle = {
    active: 'My Notes',
    archived: 'Archived Notes',
    trash: 'Trash Bin'
  }[currentView];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex-1 max-w-2xl">
            <SearchBar 
              query={searchQuery} 
              onQueryChange={setSearchQuery} 
              mode={searchMode} 
              onModeChange={setSearchMode}
              isLoading={isSearching}
            />
          </div>
          <button
            onClick={() => { 
              setEditingNote(undefined); 
              setIsFormOpen(true); 
            }}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-900/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            <i className="fas fa-plus"></i>
            <span>New Note</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
             <i className={`fas ${currentView === 'trash' ? 'fa-trash' : currentView === 'archived' ? 'fa-archive' : 'fa-layer-group'} text-indigo-500`}></i>
             {viewTitle}
             <span className="text-sm font-normal text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full">{displayedNotes.length}</span>
          </h2>
        </div>

        {isSearching && searchMode === SearchMode.SEMANTIC ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <i className="fas fa-sparkles text-4xl text-indigo-500 mb-4"></i>
            <p className="text-zinc-400 font-medium">AI is thinking...</p>
          </div>
        ) : displayedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-600">
            <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-zinc-800">
              <i className={`fas ${currentView === 'trash' ? 'fa-trash-can' : 'fa-feather-pointed'} text-4xl text-zinc-700`}></i>
            </div>
            <p className="text-xl font-semibold text-zinc-400">
              {currentView === 'trash' ? 'Your bin is empty' : 'No notes found'}
            </p>
            <p className="text-sm mt-1">
              {currentView === 'trash' ? 'Notes you delete will appear here for 30 days.' : 'Start by clicking "New Note" to capture your ideas.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedNotes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onEdit={() => handleEditNote(note)}
                onView={() => handleViewNote(note)}
                onDelete={() => handleTrashNote(note.id)}
                onRestore={() => handleRestoreNote(note.id)}
                onPermanentDelete={() => handlePermanentDelete(note.id)}
                onArchive={() => handleArchiveNote(note.id)}
                relevanceReason={
                  searchMode === SearchMode.SEMANTIC && searchQuery.trim() 
                  ? semanticResults.find(r => r.noteId === note.id)?.reason 
                  : undefined
                }
              />
            ))}
          </div>
        )}
      </main>

      {isFormOpen && (
        <NoteForm 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSaveNote} 
          initialData={editingNote}
        />
      )}

      {viewingNote && (
        <NoteViewer 
          note={viewingNote}
          onClose={() => setViewingNote(undefined)}
          onEdit={() => handleEditNote(viewingNote)}
          onSummarize={() => handleSummarizeNote(viewingNote.id)}
        />
      )}
    </div>
  );
};

export default App;