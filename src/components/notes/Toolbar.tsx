// components/notes/Toolbar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Highlighter, 
  PlusCircle, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  BookOpen,
  X,
  Palette,
  BookmarkPlus
} from 'lucide-react';

interface ToolbarProps {
  selectedText: string;
  onHighlight: (color: string) => void;
  onAddToFlashcards: (text: string) => void;
  onClose?: () => void;
}

const HIGHLIGHT_COLORS = [
  { name: 'زرد', color: '#FFEB3B', icon: '🟡' },
  { name: 'سبز', color: '#81C784', icon: '🟢' },
  { name: 'آبی', color: '#a1d5ff', icon: '🔵' },
  { name: 'نارنجی', color: '#FFB74D', icon: '🟠' },
];

export default function Toolbar({
  selectedText,
  onHighlight,
  onAddToFlashcards,
  onClose
}: ToolbarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showColors, setShowColors] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleHighlight = (color: string) => {
    onHighlight(color);
    setShowColors(false);
    if (onClose) onClose();
  };

  const handleAddToFlashcards = () => {
    onAddToFlashcards(selectedText);
    if (onClose) onClose();
  };

  const toggleToolbar = () => {
    setIsOpen(!isOpen);
  };

  // بستن منو رنگ‌ها با کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showColors && 
        toolbarRef.current && 
        !toolbarRef.current.contains(event.target as Node)
      ) {
        setShowColors(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColors]);

  return (
    <div 
      ref={toolbarRef}
      className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50"
    >
      {/* Main Toolbar */}
      <div className={`
        flex flex-col items-center gap-2
        bg-white dark:bg-gray-800
        rounded-2xl shadow-2xl border
        border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-out
        ${isOpen ? 'w-14 p-2' : 'w-0 p-0 overflow-hidden'}
      `}>
        {/* Close Button */}
        {isOpen && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        )}

        {/* Divider */}
        {isOpen && <div className="w-8 h-px bg-gray-200 dark:bg-gray-700 my-1" />}

        {/* Highlight Button with Color Picker */}
        {isOpen && (
          <div className="relative">
            <button
              onClick={() => setShowColors(!showColors)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group"
              title="هایلایت"
            >
              <Highlighter className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-yellow-500" />
            </button>

            {/* Color Picker */}
            {showColors && (
              <div className="mt-16 absolute right-12 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 w-[40px]">
                <div className="flex flex-col gap-2">
                  {HIGHLIGHT_COLORS.map(({ name, color, icon }) => (
                    <button
                      key={name}
                      onClick={() => handleHighlight(color)}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div 
                        className="w-6 h-6 rounded-md shadow-sm"
                        style={{ backgroundColor: color }}
                      />
         
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add to Flashcards Button */}
        {isOpen && (
          <button
            onClick={handleAddToFlashcards}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group"
            title="افزودن به فلش‌کارت"
          >
            <PlusCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-green-500" />
          </button>
        )}

        {/* Divider */}
        {isOpen && <div className="w-8 h-px bg-gray-200 dark:bg-gray-700 my-1" />}


      </div>


    </div>
  );
}