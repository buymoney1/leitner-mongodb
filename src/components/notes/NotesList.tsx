// components/notes/NotesList.tsx
'use client';

import { useState } from 'react';
import { Edit, Eye, Calendar, Trash2, Plus } from 'lucide-react';
import NoteForm from './NoteForm';

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

interface NotesListProps {
  notes: Note[];
  onNoteCreate: (data: { title: string; content: string }) => Promise<void>;
  onNoteUpdate: (id: string, data: { title: string; content: string }) => Promise<void>;
  onNoteDelete: (id: string) => Promise<void>;
  onNoteClick?: (note: Note) => void;
}

export default function NotesList({
  notes,
  onNoteCreate,
  onNoteUpdate,
  onNoteDelete,
  onNoteClick
}: NotesListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: { title: string; content: string }) => {
    if (editingNote) {
      await onNoteUpdate(editingNote.id, data);
    } else {
      await onNoteCreate(data);
    }
    setEditingNote(null);
  };

  const handleDelete = async (noteId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این یادداشت را حذف کنید؟')) {
      setDeletingNoteId(noteId);
      try {
        await onNoteDelete(noteId);
      } finally {
        setDeletingNoteId(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">یادداشت‌های من</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            تعداد: {notes.length}
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
        >
          <Plus size={16} />
          یادداشت جدید
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Edit className="h-8 w-8 text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">هنوز یادداشتی ثبت نکرده‌اید.</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
          >
            اولین یادداشت را بنویسید
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-800 dark:text-gray-200 text-sm font-medium truncate mb-1">
                        {note.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                        {note.content.substring(0, 120)}
                        {note.content.length > 120 && '...'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                    {note.highlights && note.highlights.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <span>{note.highlights.length} هایلایت</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  {onNoteClick && (
                    <button
                      onClick={() => onNoteClick(note)}
                      className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="مشاهده جزییات"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="ویرایش"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingNoteId === note.id}
                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <NoteForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingNote(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingNote || undefined}
        isEditing={!!editingNote}
      />
    </div>
  );
}