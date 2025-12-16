// app/notes/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NoteDetail from '@/components/notes/NoteDetail';

interface Highlight {
  id: string;
  text: string;
  start: number;
  end: number;
  color: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  highlights?: Highlight[];
}

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchNote();
    }
  }, [params.id]);

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setNote(data);
      } else if (response.status === 404) {
        router.push('/notes');
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNote = async (noteId: string, data: { highlights?: Highlight[] }) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNote(updatedNote);
        return updatedNote;
      }
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleHighlightAdd = async (highlightData: Omit<Highlight, 'id'>) => {
    if (!note) return;
    
    try {
      const response = await fetch(`/api/notes/${note.id}/highlights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(highlightData)
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNote(updatedNote);
      }
    } catch (error) {
      console.error('Error adding highlight:', error);
      throw error;
    }
  };

  const handleHighlightRemove = async (highlightId: string) => {
    if (!note) return;
    
    try {
      const response = await fetch(`/api/notes/${note.id}/highlights?highlightId=${highlightId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNote(updatedNote);
      }
    } catch (error) {
      console.error('Error removing highlight:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">یادداشت یافت نشد</p>
      </div>
    );
  }

  return (
    <NoteDetail
      note={note}
      onHighlightAdd={handleHighlightAdd}
      onHighlightRemove={handleHighlightRemove}
      onUpdate={handleUpdateNote}
    />
  );
}