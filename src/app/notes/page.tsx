// app/notes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import NotesList from '@/components/notes/NotesList';
import { useRouter } from 'next/navigation';

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

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
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
  };

  const handleCreateNote = async (data: { title: string; content: string }) => {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      fetchNotes();
    }
  };

  const handleUpdateNote = async (id: string, data: { title: string; content: string }) => {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      fetchNotes();
    }
  };

  const handleDeleteNote = async (id: string) => {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const handleNoteClick = (note: Note) => {
    router.push(`/notes/${note.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <NotesList
        notes={notes}
        onNoteCreate={handleCreateNote}
        onNoteUpdate={handleUpdateNote}
        onNoteDelete={handleDeleteNote}
        onNoteClick={handleNoteClick}
      />
    </div>
  );
}