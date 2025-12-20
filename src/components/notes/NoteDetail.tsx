// components/notes/NoteDetail.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  Sparkles,
  BookOpen,
  Share2,
  Bookmark,
  AlertCircle
} from 'lucide-react';
import NoteHighlighter from './NoteHighlighter';
import Link from 'next/link';
import { toast } from 'sonner';

interface Highlight {
  id: string;
  text: string;
  start: number;
  end: number;
  color: string;
}

interface NoteDetailProps {
  note?: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    highlights?: Highlight[];
  };
  onHighlightAdd?: (highlight: Omit<Highlight, 'id'>) => Promise<void>;
  onHighlightRemove?: (highlightId: string) => Promise<void>;
  onUpdate?: (noteId: string, data: { highlights?: Highlight[] }) => Promise<void>;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
}

export default function NoteDetail({
  note,
  onHighlightAdd,
  onHighlightRemove,
  onUpdate,
  onEdit,
  onDelete
}: NoteDetailProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);

  // مقداردهی اولیه highlights از note
  useEffect(() => {
    if (note?.highlights) {
      setHighlights(note.highlights);
    } else {
      setHighlights([]);
    }
  }, [note?.highlights]);

  // اگر note وجود ندارد، صفحه خطا نمایش داده شود
  if (!note) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            یادداشت یافت نشد
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            یادداشت مورد نظر وجود ندارد یا حذف شده است.
          </p>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            بازگشت به یادداشت‌ها
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const handleAddToFlashcards = async (word: string, meaning: string) => {
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          front: word.trim(), 
          back: meaning.trim() 
        }),
      });

      if (response.ok) {
        toast.success('کارت با موفقیت به فلش‌کارت‌ها اضافه شد.');
        return Promise.resolve();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در افزودن کارت.");
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور.');
      return Promise.reject(error);
    }
  };

  const handleHighlightAdd = async (highlightData: Omit<Highlight, 'id'>) => {
    const newHighlight = {
      ...highlightData,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    const updatedHighlights = [...highlights, newHighlight];
    setHighlights(updatedHighlights);
    
    if (onHighlightAdd) {
      await onHighlightAdd(highlightData);
    }
    
    // ذخیره خودکار هایلایت‌ها
    if (onUpdate) {
      setIsSaving(true);
      try {
        await onUpdate(note.id, { highlights: updatedHighlights });
        toast.success('هایلایت ذخیره شد');
      } catch (error) {
        toast.error('خطا در ذخیره‌سازی هایلایت');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleHighlightRemove = async (highlightId: string) => {
    const updatedHighlights = highlights.filter(h => h.id !== highlightId);
    setHighlights(updatedHighlights);
    
    if (onHighlightRemove) {
      await onHighlightRemove(highlightId);
    }
    
    // ذخیره خودکار هایلایت‌ها
    if (onUpdate) {
      setIsSaving(true);
      try {
        await onUpdate(note.id, { highlights: updatedHighlights });
        toast.success('هایلایت حذف شد');
      } catch (error) {
        toast.error('خطا در حذف هایلایت');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: note.content.substring(0, 100),
          url: window.location.href,
        });
      } catch (err) {
        console.log('خطا در اشتراک‌گذاری');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('لینک یادداشت کپی شد');
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'از نشان‌ها حذف شد' : 'به نشان‌ها اضافه شد');
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (confirm('آیا مطمئن هستید که می‌خواهید این یادداشت را حذف کنید؟')) {
      try {
        await onDelete();
        toast.success('یادداشت با موفقیت حذف شد');
      } catch (error) {
        toast.error('خطا در حذف یادداشت');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/notes"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">بازگشت</span>
              </Link>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(note.createdAt)}</span>
                <span className="mx-1">•</span>
                <Clock className="h-4 w-4" />
                <span>{formatTime(note.createdAt)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">

              <button
                onClick={handleShare}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="اشتراک‌گذاری"
              >
                <Share2 className="h-5 w-5" />
              </button>
    
              
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="ویرایش یادداشت"
                >
                  <Edit className="h-5 w-5" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="حذف یادداشت"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="text-center mb-6">
   
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-full border border-blue-200 dark:border-blue-800 mb-6">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">یادداشت شخصی</span>
            </div>
            
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white  leading-tight tracking-tight">
              {note.title}
            </h1>
            
        
  
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Note Content */}
          <div className={`${showHighlights ? 'lg:w-2/3' : 'w-full'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="">
                <div dir='ltr' className="text-justify text-xs prose prose-lg dark:prose-invert max-w-none">
                  <NoteHighlighter
                    content={note.content}
                    highlights={highlights}
                    onHighlightAdd={handleHighlightAdd}
                    onHighlightRemove={handleHighlightRemove}
                    onAddToFlashcards={handleAddToFlashcards}
                    readOnly={!onHighlightAdd}
                  />
                </div>
                
                {/* Tips */}

              </div>
            </div>
          </div>

          {/* Highlights Sidebar */}
          {showHighlights && (
            <div className="mb-2 lg:w-1/3">
              <div className="sticky top-28 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">هایلایت‌ها</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">تعداد: {highlights.length}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                    {highlights.length} مورد
                  </div>
                </div>
                
                {highlights.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {highlights.map((highlight) => (
                      <div
                        key={highlight.id}
                        className="group relative bg-white dark:bg-gray-800 rounded-lg py-2 px-2 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-md cursor-pointer"
                        onClick={() => {
                          toast.info('اسکرول به موقعیت هایلایت در متن');
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: highlight.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-relaxed line-clamp-2">
                              {highlight.text}
                            </p>
                          </div>
                          {onHighlightRemove && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHighlightRemove(highlight.id);
                              }}
                              className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                              title="حذف هایلایت"
                            >
                              <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                    </div>
                    <h4 className="text-gray-600 dark:text-gray-400 font-medium mb-2">هنوز هایلایتی ندارید</h4>
                    <p className="text-gray-500 dark:text-gray-500 text-sm">
                      متن مورد نظر خود را انتخاب کنید و هایلایت کنید
                    </p>
                  </div>
                )}
                
               
              </div>
            </div>
          )}



        </div>
        <div className="p-2 mb-15 mt-6">
  <div className="flex items-center gap-3 mb-4">
    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <Sparkles className="h-5 w-5 text-gray-600 dark:text-gray-400" />
    </div>
    <h3 className="font-semibold text-gray-800 dark:text-gray-200">راهنمای استفاده</h3>
  </div>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div className="py-5 flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">۱</span>
      </div>
      <p className=" text-sm text-gray-700 dark:text-gray-300">
        متن مورد نظر را انتخاب کنید و از گزینه های سمت راست صفحه، برای افزودن به لایتنر و هایلایت کردن استفاده کنید.
      </p>
    </div>
    
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
      <div className=" flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">۲</span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        روی کلمات انگلیسی کلیک کنید تا معنی آن‌ها را جستجو کنید
      </p>
    </div>
  </div>
</div>
        

      </div>
    </div>
  );
}