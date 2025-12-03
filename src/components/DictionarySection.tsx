import { useState, useEffect } from 'react';
import { DictionaryIcon } from './icons';
import { DictionaryData } from '../../types';

interface DictionarySectionProps {
  word: string;
  onWordSelect: (word: string) => void;
}

export default function DictionarySection({ word, onWordSelect }: DictionarySectionProps) {
  const [dictionaryData, setDictionaryData] = useState<DictionaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (word.trim() && word.length > 2) {
      fetchDictionaryData(word);
    } else {
      setDictionaryData(null);
    }
  }, [word]);

  const fetchDictionaryData = async (searchWord: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord.toLowerCase()}`);
      
      if (response.ok) {
        const data = await response.json();
        setDictionaryData(data[0]);
      } else {
        setDictionaryData(null);
      }
    } catch (error) {
      console.error("Dictionary API error:", error);
      setDictionaryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!word.trim() || word.length < 3) {
    return null;
  }

  return (
    <div className="bg-gray-100 rounded-xl border border-gray-300 p-4">
      <div className="flex items-center gap-2 mb-3">
        <DictionaryIcon />
        <h3 className="text-gray-900 font-semibold">اطلاعات دیکشنری</h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-600 text-sm mr-2">در حال دریافت اطلاعات...</span>
        </div>
      ) : dictionaryData ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {dictionaryData.phonetic && (
                <span className="text-gray-600 text-sm">/{dictionaryData.phonetic}/</span>
              )}
            </div>
            <div className="flex gap-2">
              {dictionaryData.meanings?.slice(0, 2).map((meaning: any, index: number) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-500/20 text-blue-700 rounded-lg text-xs"
                >
                  {meaning.partOfSpeech}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {dictionaryData.meanings?.slice(0, 3).map((meaning: any, meaningIndex: number) => (
              <div key={meaningIndex} className="border-r-2 border-blue-500/30 pr-3">
                <p className="text-blue-700 text-sm font-medium mb-1">
                  {meaning.partOfSpeech}
                </p>
                <ul className="space-y-1">
                  {meaning.definitions?.slice(0, 3).map((def: any, defIndex: number) => (
                    <li key={defIndex} className="text-gray-700 text-sm flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{def.definition}</span>
                    </li>
                  ))}
                </ul>
                
                {meaning.definitions?.[0]?.example && (
                  <div className="mt-2 p-2 bg-gray-200 rounded-lg border-r-2 border-purple-500/30">
                    <p className="text-purple-700 text-xs font-medium mb-1">مثال:</p>
                    <p className="text-gray-700 text-sm italic">"{meaning.definitions[0].example}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {dictionaryData.meanings?.[0]?.synonyms && dictionaryData.meanings[0].synonyms.length > 0 && (
            <div className="pt-2 border-t border-gray-300">
              <p className="text-blue-700 text-sm font-medium mb-2">مترادف‌ها:</p>
              <div className="flex flex-wrap gap-1">
                {dictionaryData.meanings[0].synonyms.slice(0, 5).map((synonym: string, index: number) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition-colors cursor-pointer"
                    onClick={() => onWordSelect(synonym)}
                  >
                    {synonym}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-gray-400 text-lg mb-2">📚</div>
          <p className="text-gray-500 text-sm">اطلاعاتی برای این کلمه یافت نشد</p>
        </div>
      )}
    </div>
  );
}