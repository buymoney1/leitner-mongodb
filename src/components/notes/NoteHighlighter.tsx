// components/notes/NoteHighlighter.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Highlighter, Trash2, PlusCircle, Sparkles, X } from 'lucide-react';
import DictionaryModal from '@/components/DictionaryModal';
import { toast } from 'sonner';

interface Highlight {
  id: string;
  text: string;
  start: number;
  end: number;
  color: string;
}

interface NoteHighlighterProps {
  content?: string;
  highlights?: Highlight[];
  onHighlightAdd?: (highlight: Omit<Highlight, 'id'>) => void;
  onHighlightRemove?: (highlightId: string) => void;
  onAddToFlashcards?: (word: string, meaning: string) => Promise<void>;
  readOnly?: boolean;
}


const HIGHLIGHT_COLORS = [
  { name: 'زرد', color: '#FFEB3B' },
  { name: 'سبز', color: '#81C784' },
  { name: 'آبی', color: '#a1d5ff' },
  { name: 'نارنجی', color: '#FFB74D' },
];

export default function NoteHighlighter({
  content = '',
  highlights = [],
  onHighlightAdd,
  onHighlightRemove,
  onAddToFlashcards,
  readOnly = false
}: NoteHighlighterProps) {
  const [selectedText, setSelectedText] = useState('');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isDictionaryModalOpen, setIsDictionaryModalOpen] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState('');
  
  const contentRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Selection | null>(null);

  if (!content) {
    return (
      <div className="whitespace-pre-wrap leading-relaxed text-sm text-gray-700 dark:text-gray-300 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[200px] flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>محتوایی برای نمایش وجود ندارد</p>
        </div>
      </div>
    );
  }

  // Detect text selection
  useEffect(() => {
    const handleSelection = () => {
      if (readOnly) return;
      
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        return;
      }

      const text = selection.toString().trim();
      if (!text || text.length < 2) {
        return;
      }

      if (contentRef.current && !contentRef.current.contains(selection.anchorNode)) {
        return;
      }

      const isNearHighlight = highlights?.some(highlight => {
        return text.includes(highlight.text) || highlight.text.includes(text);
      });

      if (isNearHighlight) {
        selection.removeAllRanges();
        return;
      }

      selectionRef.current = selection;
      setSelectedText(text);
      setShowActionMenu(true);
    };

    document.addEventListener('mouseup', handleSelection);
    
    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, [readOnly, highlights]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickInsideContent = contentRef.current?.contains(target);
      const isClickInsideMenu = target.closest('.action-menu-modal');
      
      if (!isClickInsideContent && !isClickInsideMenu && showActionMenu) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionMenu]);

  const handleWordClick = (word: string) => {
    setDictionaryWord(word);
    setIsDictionaryModalOpen(true);
  };

  const handleAddToFlashcards = async () => {
    if (!selectedText || !onAddToFlashcards) return;
    
    setDictionaryWord(selectedText);
    setIsDictionaryModalOpen(true);
    closeMenu();
  };

  const handleDictionaryAdd = async (word: string, meaning: string) => {
    if (onAddToFlashcards) {
      try {
        await onAddToFlashcards(word, meaning);
        toast.success('کارت با موفقیت به فلش‌کارت‌ها اضافه شد');
      } catch (error) {
        toast.error('خطا در افزودن کارت');
      }
    }
  };

  const handleHighlight = (color: string) => {
    if (selectedText && onHighlightAdd && selectionRef.current) {
      const selection = selectionRef.current;
      const range = selection.getRangeAt(0);
      
      try {
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(contentRef.current!);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const end = start + selectedText.length;

        onHighlightAdd({
          text: selectedText,
          start,
          end,
          color
        });
        
        toast.success('متن با موفقیت هایلایت شد');
      } catch (error) {
        toast.error('خطا در هایلایت کردن متن');
      }
    }
    closeMenu();
  };

  const removeHighlight = (highlightId: string) => {
    if (onHighlightRemove) {
      onHighlightRemove(highlightId);
      toast.success('هایلایت حذف شد');
    }
  };

  const closeMenu = () => {
    setShowActionMenu(false);
    setSelectedText('');
    selectionRef.current = null;
    window.getSelection()?.removeAllRanges();
  };

  // Render text with clickable words
  const renderText = () => {
    if (!highlights || highlights.length === 0) {
      return renderPlainText();
    }

    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];

    sortedHighlights.forEach((highlight) => {
      if (highlight.start > lastIndex) {
        elements.push(renderTextSegment(content.slice(lastIndex, highlight.start)));
      }

      elements.push(
        <mark
          key={`highlight-${highlight.id}`}
          style={{ backgroundColor: highlight.color }}
          className="px-1 rounded cursor-pointer relative group transition-colors duration-200"
          onClick={() => handleWordClick(highlight.text)}
        >
          {content.slice(highlight.start, highlight.end)}
          {!readOnly && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeHighlight(highlight.id);
              }}
              className="absolute -top-1 -right-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              title="حذف هایلایت"
            >
              <Trash2 size={12} />
            </button>
          )}
        </mark>
      );

      lastIndex = highlight.end;
    });

    if (lastIndex < content.length) {
      elements.push(renderTextSegment(content.slice(lastIndex)));
    }

    return elements;
  };

  const renderPlainText = () => {
    return renderTextSegment(content);
  };

  const renderTextSegment = (text: string) => {
    const segments = text.split(/(\s+)/);
    
    return segments.map((segment, index) => {
      if (segment.match(/^\s+$/)) {
        return <span key={`space-${index}`}>{segment}</span>;
      }

      const cleanWord = segment.replace(/[^\w]/g, '');
      
      if (cleanWord.length > 1 && /^[a-zA-Z]+$/.test(cleanWord)) {
        return (
          <span
            key={`word-${index}`}
            onClick={() => handleWordClick(cleanWord)}
            className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 px-0.5 rounded transition-colors duration-200"
            title="کلیک برای جستجو در دیکشنری"
          >
            {segment}
          </span>
        );
      }

      return <span key={`text-${index}`}>{segment}</span>;
    });
  };

  return (
    <>
      <DictionaryModal
        isOpen={isDictionaryModalOpen}
        onClose={() => setIsDictionaryModalOpen(false)}
        initialWord={dictionaryWord}
        onAddToFlashcards={handleDictionaryAdd}
      />

      <div
        ref={contentRef}
        className="whitespace-pre-wrap leading-relaxed text-sm text-gray-700 dark:text-gray-300 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[200px] select-text cursor-text"
      >
        {renderText()}
      </div>

      {/* Action Menu Modal */}
      {showActionMenu && selectedText && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={closeMenu}
          />
          
          <div className="action-menu-modal fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded">
                      <Sparkles className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">عملیات روی متن</span>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                        متن انتخاب شده شما
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeMenu}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Selected Text Preview */}
              <div className="p-4">
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 text-right leading-relaxed">
                    "{selectedText}"
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleAddToFlashcards}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white rounded-lg text-sm transition-colors duration-200"
                  >
                    <PlusCircle className="h-4 w-4" />
                    افزودن به فلش‌کارت
                  </button>

                  <div className="text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      یا هایلایت با رنگ:
                    </span>
                  </div>

                  {/* Color Options */}
                  <div className="grid grid-cols-4 gap-2">
                    {HIGHLIGHT_COLORS.map(({ name, color }) => (
                      <button
                        key={name}
                        onClick={() => handleHighlight(color)}
                        className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 group"
                      >
                        <div 
                          className="h-8 w-8 rounded-md mb-1 shadow-sm group-hover:scale-105 transition-transform duration-200"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={closeMenu}
                    className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}