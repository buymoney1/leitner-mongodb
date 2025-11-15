// components/video/VocabularyList.tsx
'use client';

import { useState } from 'react';
import { Vocabulary } from './VideoPlayer'; // تایپ را از کامپوننت اصلی می‌گیریم

type VocabularyListProps = {
  vocabularies: Vocabulary[];
};

export default function VocabularyList({ vocabularies }: VocabularyListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVocabularies = vocabularies.filter(vocab =>
    vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="جستجوی لغت یا معنی..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
      <div className="space-y-2">
        {filteredVocabularies.length > 0 ? (
          filteredVocabularies.map((vocab) => (
            <div key={vocab.id} className="p-3 bg-gray-700 rounded-lg">
              <p className="font-semibold text-cyan-300">{vocab.word}</p>
              <p className="text-sm text-gray-300">{vocab.meaning}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">لغتی برای این ویدیو ثبت نشده است.</p>
        )}
      </div>
    </div>
  );
}