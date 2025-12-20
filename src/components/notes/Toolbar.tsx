// components/notes/Toolbar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Highlighter, PlusCircle } from 'lucide-react';

interface ToolbarProps {
  selectedText: string;
  onHighlight: (color: string) => void;
  onAddToFlashcards: (text: string) => void;
}

const HIGHLIGHT_COLORS = [
  { name: 'yellow', color: '#FFEB3B' },
  { name: 'green', color: '#81C784' },
  { name: 'blue', color: '#A1D5FF' },
  { name: 'orange', color: '#FFB74D' },
];

export default function Toolbar({
  selectedText,
  onHighlight,
  onAddToFlashcards,
}: ToolbarProps) {
  const [showColors, setShowColors] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  /* ---------------- Close color picker on outside click ---------------- */
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

  /* ---------------- Handlers ---------------- */
  const handleHighlight = (color: string) => {
    if (!selectedText) return;
    onHighlight(color);
    setShowColors(false);
  };

  const handleAddToFlashcards = () => {
    if (!selectedText) return;
    onAddToFlashcards(selectedText);
  };

  return (
    <div
      ref={toolbarRef}
      className="
        fixed right-3 top-2/3 -translate-y-1/2 z-50
        opacity-60 hover:opacity-100
        transition-opacity duration-300
      "
    >
      <div
        className="
          flex flex-col items-center gap-2
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-2xl shadow-xl
          w-12 py-2
          hover:w-14
          transition-all duration-300
        "
      >
        {/* Highlight */}
        <div className="relative">
          <button
            onClick={() => setShowColors(prev => !prev)}
            disabled={!selectedText}
            title="هایلایت متن"
            className="
              p-2 rounded-xl
              transition-colors
              hover:bg-gray-100 dark:hover:bg-gray-700
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            <Highlighter
              className="
                h-5 w-5
                text-gray-500
                hover:text-yellow-500
              "
            />
          </button>

          {/* Color Picker */}
          {showColors && (
            <div
              className="
                absolute right-14 top-1/2 -translate-y-1/2
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-xl shadow-xl
                p-2 flex flex-col gap-2
              "
            >
              {HIGHLIGHT_COLORS.map(({ name, color }) => (
                <button
                  key={name}
                  onClick={() => handleHighlight(color)}
                  className="
                    w-6 h-6 rounded-md
                    ring-1 ring-black/10
                    hover:scale-110
                    transition-transform
                  "
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add to Flashcards */}
        <button
          onClick={handleAddToFlashcards}
          disabled={!selectedText}
          title="افزودن به فلش‌کارت"
          className="
            p-2 rounded-xl
            transition-colors
            hover:bg-gray-100 dark:hover:bg-gray-700
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          <PlusCircle
            className="
              h-5 w-5
              text-gray-500
              hover:text-green-500
            "
          />
        </button>
      </div>
    </div>
  );
}
