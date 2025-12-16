// hooks/useNotes.ts
import { useState, useCallback } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  highlights?: Array<{
    id: string;
    text: string;
    start: number;
    end: number;
    color: string;
  }>;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNote = async (data: { title: string; content: string }) => {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const newNote = await response.json();
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    }
    return null;
  };

  const updateNote = async (id: string, data: { title: string; content: string }) => {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const updatedNote = await response.json();
      setNotes(prev => prev.map(note => 
        note.id === id ? updatedNote : note
      ));
      return updatedNote;
    }
    return null;
  };

  const deleteNote = async (id: string) => {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      setNotes(prev => prev.filter(note => note.id !== id));
      return true;
    }
    return false;
  };

  const addHighlight = async (noteId: string, highlight: any) => {
    const response = await fetch(`/api/notes/${noteId}/highlights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(highlight)
    });

    if (response.ok) {
      const updatedNote = await response.json();
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
      return updatedNote;
    }
    return null;
  };

  const removeHighlight = async (noteId: string, highlightId: string) => {
    const response = await fetch(`/api/notes/${noteId}/highlights?highlightId=${highlightId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      const updatedNote = await response.json();
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
      return updatedNote;
    }
    return null;
  };

  return {
    notes,
    isLoading,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    addHighlight,
    removeHighlight
  };
}