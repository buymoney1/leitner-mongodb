// components/notes/NotesList.tsx
'use client';

import { useState } from 'react';
import { Edit, Eye, Calendar, Trash2, Plus, MoreVertical } from 'lucide-react';
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
  const [showActions, setShowActions] = useState<string | null>(null);

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
    setShowActions(null);
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
        setShowActions(null);
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

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      month: 'numeric',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-4">
      {/* هدر */}
      <div className="flex justify-between items-center px-4 pt-4 md:px-0">
        <div>
          <h2 className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200">
            یادداشت‌های من
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            تعداد: {notes.length}
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white rounded-lg transition-colors text-xs md:text-sm shadow-sm flex-shrink-0"
        >
          <Plus size={14} className="md:size-4" />
          <span className="hidden md:inline">یادداشت جدید</span>
          <span className="md:hidden">جدید</span>
        </button>
      </div>

      {/* لیست یادداشت‌ها */}
      {notes.length === 0 ? (
        <div className="mx-4 md:mx-0 text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Edit className="h-6 w-6 md:h-8 md:w-8 text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">
            هنوز یادداشتی ثبت نکرده‌اید.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
          >
            اولین یادداشت را بنویسید
          </button>
        </div>
      ) : (
        <div className="space-y-3 px-4 md:px-0">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200 shadow-sm overflow-hidden"
            >
              {/* هدر یادداشت برای موبایل */}
              <div className="md:hidden flex justify-between items-start gap-2 mb-3">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <h3 className="text-gray-800 dark:text-gray-200 text-sm font-medium break-words line-clamp-2">
                    {note.title}
                  </h3>
                </div>
                
                {/* منو عملیات موبایل */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setShowActions(showActions === note.id ? null : note.id)}
                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  {showActions === note.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setShowActions(null)}
                      />
                      <div className=" absolute left-0  w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                        {onNoteClick && (
                          <button
                            onClick={() => {
                              onNoteClick(note);
                              setShowActions(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-right text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Eye size={14} />
                            مشاهده                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(note)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-right text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit size={14} />
                          ویرایش
                        </button>
                        <button
                          onClick={() => {
                            setShowActions(null);
                            handleDelete(note.id);
                          }}
                          disabled={deletingNoteId === note.id}
                          className="flex items-center gap-2 w-full px-4 py-2 text-right text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          حذف
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* محتوای یادداشت */}
              <div className="md:flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  {/* عنوان برای دسکتاپ */}
                  <h3 className="hidden md:block text-gray-800 dark:text-gray-200 text-sm font-medium break-words line-clamp-2 mb-2">
                    {note.title}
                  </h3>
                  
                  {/* محتوا */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm break-words line-clamp-2 mb-3 md:mb-2">
                    {note.content}
                  </p>
                  
                  {/* فوتر اطلاعات */}
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Calendar size={12} />
                      <span className="hidden md:inline">{formatDate(note.createdAt)}</span>
                      <span className="md:hidden">{formatDateShort(note.createdAt)}</span>
                    </div>
                    {note.highlights && note.highlights.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <span>{note.highlights.length} هایلایت</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* دکمه‌های عملیات برای دسکتاپ */}
                <div className="hidden md:flex gap-1 flex-shrink-0 mt-1">
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

      {/* فرم ایجاد/ویرایش */}
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