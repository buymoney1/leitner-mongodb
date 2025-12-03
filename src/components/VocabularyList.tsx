import { Vocabulary } from '../types';
import { DictionaryIcon } from './icons';

interface VocabularyListProps {
  vocabularies: Vocabulary[];
  onWordClick: (word: string) => void;
  onRemoveWord: (id: string) => void;
}

export default function VocabularyList({ 
  vocabularies, 
  onWordClick, 
  onRemoveWord 
}: VocabularyListProps) {
  return (
    <div className="space-y-3">
      {vocabularies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          هنوز لغتی ذخیره نکرده‌اید. روی کلمات انگلیسی در زیرنویس‌ها کلیک کنید.
        </div>
      ) : (
        vocabularies.map((vocab) => (
          <div
            key={vocab.id}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 transition-all duration-200 group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span 
                  className="text-lg font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
                  onClick={() => onWordClick(vocab.word)}
                >
                  {vocab.word}
                </span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-700">{vocab.meaning}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onWordClick(vocab.word)}
                  className="text-xs text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                >
                  <DictionaryIcon />
                  مشاهده در دیکشنری
                </button>
              </div>
            </div>
            <button
              onClick={() => onRemoveWord(vocab.id)}
              className="text-red-500 hover:text-red-700 transition-colors p-2 opacity-0 group-hover:opacity-100"
              title="حذف از لیست"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))
      )}
    </div>
  );
}