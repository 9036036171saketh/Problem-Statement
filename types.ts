
export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  isDeleted?: boolean;
  isArchived?: boolean;
}

export interface SearchResult {
  noteId: string;
  relevanceScore: number;
  reason: string;
}

export enum SearchMode {
  KEYWORD = 'KEYWORD',
  SEMANTIC = 'SEMANTIC'
}

export type ViewType = 'active' | 'archived' | 'trash';