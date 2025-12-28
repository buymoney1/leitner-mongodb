// components/video/DeleteVideoButton.tsx
'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteVideoButtonProps {
  videoId: string;
}

export default function DeleteVideoButton({ videoId }: DeleteVideoButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این ویدیو مطمئن هستید؟')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('ویدیو با موفقیت حذف شد');
        // رفرش صفحه
        window.location.reload();
      } else {
        const data = await response.json();
        alert(`خطا: ${data.error || 'خطا در حذف ویدیو'}`);
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white p-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed"
      title="حذف ویدیو"
    >
      {isDeleting ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}