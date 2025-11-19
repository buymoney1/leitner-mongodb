// components/video/VocabularyList.tsx
'use client';

import { useState } from 'react';
import { Vocabulary } from './VideoPlayer';
import { Search, BookOpen, Sparkles } from 'lucide-react';

type VocabularyListProps = {
  vocabularies: Vocabulary[];
};

export default function VocabularyList({ vocabularies }: VocabularyListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWord, setSelectedWord] = useState<Vocabulary | null>(null);

  const filteredVocabularies = vocabularies.filter(vocab =>
    vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-full bg-white dark:bg-gray-900 transition-colors duration-300 p-4">

      {/* Search Box */}
      <div className="relative mb-6 group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
        <div className="relative bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-300 dark:border-gray-700/50 backdrop-blur-xl">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-cyan-500 dark:text-cyan-400 w-5 h-5" />
          <input
            type="text"
            placeholder="جستجوی لغت یا معنی..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pr-12 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-2xl"
          />
        </div>
      </div>

      {/* Vocabulary List */}
      <div className="space-y-3 mb-10">
        {filteredVocabularies.length > 0 ? (
          filteredVocabularies.map((vocab, index) => (
            <div
              key={vocab.id}
              onClick={() => setSelectedWord(vocab)}
              className={`px-3 pt-2 pb-1 rounded-2xl border backdrop-blur-sm transition-all duration-300 cursor-pointer group relative overflow-hidden
                ${selectedWord?.id === vocab.id
                  ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border-cyan-400/50 shadow-2xl shadow-cyan-500/20 transform scale-105'
                  : 'bg-gray-100/50 dark:bg-gray-800/30 border-gray-300 dark:border-gray-700/50 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-600/50 hover:shadow-lg'
                }`}
            >
              {/* Background Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                selectedWord?.id === vocab.id ? 'opacity-100' : ''
              }`}></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className={`font-bold text-lg tracking-wide ${
                        selectedWord?.id === vocab.id 
                          ? 'text-cyan-600 dark:text-cyan-300' 
                          : 'text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-200'
                      }`}>
                        {vocab.word}
                      </p>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      selectedWord?.id === vocab.id 
                        ? 'text-gray-700 dark:text-gray-100' 
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`}>
                      {vocab.meaning}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hover Border Effect */}
              <div className={`absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 ${
                selectedWord?.id === vocab.id ? 'opacity-100' : ''
              }`}>
                <div className="absolute inset-[2px] rounded-2xl bg-white dark:bg-gray-900"></div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm">
              <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-500 text-lg mb-2">لغتی یافت نشد</p>
              <p className="text-gray-400 dark:text-gray-600 text-sm">
                {searchTerm ? 'با معیارهای جستجوی شما هیچ لغتی مطابقت ندارد' : 'هنوز لغتی برای این ویدیو ثبت نشده است'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Word Modal */}
      {selectedWord && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 transition-colors duration-300"
          onClick={() => setSelectedWord(null)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-3xl border border-cyan-500/30 p-6 max-w-md w-full mx-auto shadow-2xl shadow-cyan-500/20 transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-cyan-600 dark:text-cyan-300 mb-2">{selectedWord.word}</h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg">{selectedWord.meaning}</p>
            </div>
            <button
              onClick={() => setSelectedWord(null)}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-medium hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-105"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {/* Custom Scrollbar */}
      <style jsx>{`
        .space-y-3 > * {
          scroll-margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}