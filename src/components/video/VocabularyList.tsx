// components/video/VocabularyList.tsx
'use client';

import { useState } from 'react';
import { Search, BookOpen, Sparkles } from 'lucide-react';

interface VideoVocabulary {
  id: string;
  word: string;
  meaning: string;
  timestamp?: number;
}

interface VocabularyListProps {
  vocabularies: VideoVocabulary[];
  onWordClick: (vocab: VideoVocabulary) => void;
}

export default function VocabularyList({ 
  vocabularies = [], 
  onWordClick 
}: VocabularyListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVocabularies = vocabularies.filter(vocab =>
    vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!vocabularies) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری لغات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">لغات ویدیو</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">کلیک روی هر لغت برای مشاهده جزئیات</p>
          </div>
          <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-sm font-medium">
            {vocabularies.length} لغت
          </span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="جستجوی لغت یا معنی..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pr-10 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-lg text-sm border border-gray-200 dark:border-gray-700"
          />
          {searchTerm && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                {filteredVocabularies.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {vocabularies.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-6 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
              <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">هنوز لغتی ثبت نشده</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">
                روی کلمات انگلیسی در زیرنویس‌ها کلیک کنید
              </p>
            </div>
          </div>
        ) : filteredVocabularies.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-6 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
              <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">لغتی یافت نشد</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">
                با معیارهای جستجوی شما هیچ لغتی مطابقت ندارد
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredVocabularies.map((vocab) => (
              <div
                key={vocab.id}
                onClick={() => onWordClick(vocab)}
                className="p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800/30 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
       
      
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {vocab.word}
                      </p>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                      {vocab.meaning}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Sparkles className="w-3 h-3" />
          <p>کلیک روی کلمات انگلیسی در زیرنویس‌ها برای افزودن به این لیست</p>
        </div>
      </div>
    </div>
  );
}