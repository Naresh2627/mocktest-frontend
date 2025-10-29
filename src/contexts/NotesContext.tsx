import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api/notes`
  : 'http://localhost:3000/api/notes';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  is_encrypted: boolean;
  is_draft: boolean;
  is_public: boolean;
  public_share_id?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  auto_saved_at?: string;
}

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  currentNote: Note | null;
  stats: any;
  fetchNotes: (params?: any) => Promise<void>;
  fetchNote: (id: string) => Promise<Note>;
  createNote: (noteData: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, noteData: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  autoSaveNote: (id: string, content: string, title?: string) => Promise<void>;
  fetchPublicNote: (shareId: string) => Promise<Note>;
  fetchStats: () => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

interface NotesProviderProps {
  children: ReactNode;
}

export const NotesProvider: React.FC<NotesProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchNotes = async (params = {}) => {
    try {
      setLoading(true);
      console.log('Fetching notes with params:', params);
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}?${queryParams}`;
      console.log('API URL:', url);
      const response = await axios.get(url);
      console.log('Notes response:', response.data);
      setNotes(response.data.notes);
    } catch (error: any) {
      console.error('Failed to fetch notes:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchNote = async (id: string): Promise<Note> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data.note;
    } catch (error: any) {
      console.error('Failed to fetch note:', error);
      throw error;
    }
  };

  const createNote = async (noteData: Partial<Note>): Promise<Note> => {
    try {
      const response = await axios.post(API_BASE_URL, noteData);
      const newNote = response.data.note;
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (error: any) {
      console.error('Failed to create note:', error);
      throw error;
    }
  };

  const updateNote = async (id: string, noteData: Partial<Note>): Promise<Note> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, noteData);
      const updatedNote = response.data.note;
      
      setNotes(prev => prev.map(note => 
        note.id === id ? updatedNote : note
      ));
      
      if (currentNote?.id === id) {
        setCurrentNote(updatedNote);
      }
      
      return updatedNote;
    } catch (error: any) {
      console.error('Failed to update note:', error);
      throw error;
    }
  };

  const deleteNote = async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      setNotes(prev => prev.filter(note => note.id !== id));
      
      if (currentNote?.id === id) {
        setCurrentNote(null);
      }
    } catch (error: any) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  };

  const autoSaveNote = async (id: string, content: string, title?: string): Promise<void> => {
    try {
      const payload: any = { content };
      if (title !== undefined) {
        payload.title = title;
      }
      
      await axios.patch(`${API_BASE_URL}/${id}/autosave`, payload);
      
      // Update the auto_saved_at timestamp in local state
      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, auto_saved_at: new Date().toISOString() } : note
      ));
      
      if (currentNote?.id === id) {
        setCurrentNote(prev => prev ? { ...prev, auto_saved_at: new Date().toISOString() } : null);
      }
    } catch (error: any) {
      console.error('Failed to auto-save note:', error);
      // Don't throw error for auto-save failures
    }
  };

  const fetchPublicNote = async (shareId: string): Promise<Note> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/public/${shareId}`);
      return response.data.note;
    } catch (error: any) {
      console.error('Failed to fetch public note:', error);
      throw error;
    }
  };

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/overview`);
      setStats(response.data.stats);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      throw error;
    }
  };

  const value = {
    notes,
    loading,
    currentNote,
    stats,
    fetchNotes,
    fetchNote,
    createNote,
    updateNote,
    deleteNote,
    autoSaveNote,
    fetchPublicNote,
    fetchStats,
    setCurrentNote,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};