// components/notes/NoteHighlighter.tsx (نسخه به‌روزرسانی شده)
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Trash2, Sparkles } from 'lucide-react';
import DictionaryModal from '@/components/DictionaryModal';
import Toolbar from './Toolbar';
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

export default function NoteHighlighter({
  content = '',
  highlights = [],
  onHighlightAdd,
  onHighlightRemove,
  onAddToFlashcards,
  readOnly = false
}: NoteHighlighterProps) {
  const [selectedText, setSelectedText] = useState('');
  const [isDictionaryModalOpen, setIsDictionaryModalOpen] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState('');
  const [showToolbar, setShowToolbar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Selection | null>(null);
  const touchMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchMoving = useRef(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleTextSelection = useCallback(() => {
    if (readOnly) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setShowToolbar(false);
      return;
    }

    const text = selection.toString().trim();
    if (!text || text.length < 2) {
      setShowToolbar(false);
      return;
    }

    if (contentRef.current && !contentRef.current.contains(selection.anchorNode)) {
      return;
    }

    // بررسی اینکه متن انتخاب شده قبلاً هایلایت نشده باشد
    const isNearHighlight = highlights?.some(highlight => {
      return text.includes(highlight.text) || highlight.text.includes(text);
    });

    if (isNearHighlight) {
      selection.removeAllRanges();
      setShowToolbar(false);
      return;
    }

    selectionRef.current = selection;
    setSelectedText(text);
    setShowToolbar(true);
  }, [readOnly, highlights]);

  const handleMobileTextSelection = useCallback(() => {
    if (readOnly || !isMobile) return;
    
    setTimeout(() => {
      const selection = window.getSelection();
      
      setTimeout(() => {
        const finalSelection = window.getSelection();
        if (!finalSelection || finalSelection.isCollapsed) {
          setShowToolbar(false);
          return;
        }

        const text = finalSelection.toString().trim();
        if (!text || text.length < 2) {
          setShowToolbar(false);
          return;
        }

        if (contentRef.current && !contentRef.current.contains(finalSelection.anchorNode)) {
          return;
        }

        // بررسی هایلایت
        const isNearHighlight = highlights?.some(highlight => {
          return text.includes(highlight.text) || highlight.text.includes(text);
        });

        if (isNearHighlight) {
          finalSelection.removeAllRanges();
          setShowToolbar(false);
          return;
        }

        selectionRef.current = finalSelection;
        setSelectedText(text);
        setShowToolbar(true);
      }, 100);
    }, 300);
  }, [readOnly, highlights, isMobile]);

  // Event handlers
  useEffect(() => {
    const handleMouseUp = () => {
      if (!isMobile) {
        handleTextSelection();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isMobile || readOnly) return;
      
      if (isTouchMoving.current) {
        isTouchMoving.current = false;
        return;
      }

      touchMoveTimeoutRef.current = setTimeout(() => {
        handleMobileTextSelection();
      }, 100);
    };

    const handleTouchMove = () => {
      if (!isMobile) return;
      isTouchMoving.current = true;
      
      if (touchMoveTimeoutRef.current) {
        clearTimeout(touchMoveTimeoutRef.current);
      }
    };

    const handleTouchStart = () => {
      if (!isMobile) return;
      isTouchMoving.current = false;
    };

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      const isClickInsideContent = contentRef.current?.contains(target);
      const isClickInsideToolbar = target.closest('.toolbar-container');
      
      if (!isClickInsideContent && !isClickInsideToolbar && showToolbar) {
        closeToolbar();
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      
      if (touchMoveTimeoutRef.current) {
        clearTimeout(touchMoveTimeoutRef.current);
      }
    };
  }, [readOnly, isMobile, handleTextSelection, handleMobileTextSelection, showToolbar]);

  const handleWordClick = (word: string) => {
    if (!isMobile) {
      setDictionaryWord(word);
      setIsDictionaryModalOpen(true);
    }
  };

  const handleToolbarAddToFlashcards = async (text: string) => {
    if (!text || !onAddToFlashcards) return;
    
    setDictionaryWord(text);
    setIsDictionaryModalOpen(true);
    closeToolbar();
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

  const handleToolbarHighlight = (color: string) => {
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
        
     
      } catch (error) {
        toast.error('خطا در هایلایت کردن متن');
      }
    }
    closeToolbar();
  };

  const removeHighlight = (highlightId: string) => {
    if (onHighlightRemove) {
      onHighlightRemove(highlightId);
      toast.success('هایلایت حذف شد');
    }
  };

  const closeToolbar = () => {
    setShowToolbar(false);
    setSelectedText('');
    selectionRef.current = null;
    
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
    }
  };

  // رندر متن
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
            className={`${isMobile ? '' : 'cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'} text-gray-700 dark:text-gray-300 px-0.5 rounded transition-colors duration-200`}
            title={isMobile ? "انتخاب کنید تا عملیات نمایش داده شود" : "کلیک برای جستجو در دیکشنری"}
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

      {!readOnly && (
        <div className="toolbar-container">
          <Toolbar
            selectedText={selectedText || ''}
            onHighlight={handleToolbarHighlight}
            onAddToFlashcards={handleToolbarAddToFlashcards}
          />
        </div>
      )}


      <div
        ref={contentRef}
        className="whitespace-pre-wrap leading-relaxed text-sm text-gray-700 dark:text-gray-300 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[200px] select-text cursor-text"
        style={{ 
          WebkitUserSelect: 'text',
          userSelect: 'text',
          WebkitTouchCallout: 'default',
          touchAction: 'manipulation',
          wordBreak: 'break-word'
        }}
        onContextMenu={(e) => {
          if (isMobile) {
            e.preventDefault();
          }
        }}
      >
        {renderText()}
      </div>
    </>
  );
}