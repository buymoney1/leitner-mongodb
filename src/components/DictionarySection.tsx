// components/video/DictionarySection.tsx
"use client";

import { useEffect, useState } from "react";

interface DictionaryData {
  word: string;
  phonetic: string;
  phonetics: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms: string[];
      antonyms: string[];
    }>;
    synonyms: string[];
    antonyms: string[];
  }>;
  license: {
    name: string;
    url: string;
  };
  sourceUrls: string[];
}

interface DictionarySectionProps {
  word: string;
  onWordSelect: (word: string) => void;
}

export default function DictionarySection({ word, onWordSelect }: DictionarySectionProps) {
  const [dictionaryData, setDictionaryData] = useState<DictionaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    if (word.trim() && word.length > 2) {
      fetchDictionaryData(word);
    } else {
      setDictionaryData(null);
      setError(null);
    }
  }, [word]);

  const fetchDictionaryData = async (searchWord: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord.toLowerCase()}`);
      
      if (response.ok) {
        const data = await response.json();
        setDictionaryData(data[0]);
      } else if (response.status === 404) {
        setError("کلمه در دیکشنری یافت نشد");
        setDictionaryData(null);
      } else {
        setError("خطا در دریافت اطلاعات دیکشنری");
        setDictionaryData(null);
      }
    } catch (error) {
      console.error("Dictionary API error:", error);
      setError("خطا در اتصال به دیکشنری");
      setDictionaryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (playingAudio === audioUrl) return;
    
    setPlayingAudio(audioUrl);
    const audio = new Audio(audioUrl);
    audio.play();
    audio.onended = () => setPlayingAudio(null);
    audio.onerror = () => {
      setPlayingAudio(null);
      console.error("Error playing audio");
    };
  };

  const getFirstAudioUrl = (phonetics: Array<{ audio?: string }>) => {
    return phonetics.find(phonetic => phonetic.audio)?.audio;
  };

  if (!word.trim() || word.length < 3) {
    return null;
  }

  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-700/50 p-4 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">اطلاعات دیکشنری</h3>
            <p className="text-gray-400 text-sm">جزییات کامل کلمه انگلیسی</p>
          </div>
        </div>
        
        {dictionaryData && (
          <div className="flex items-center gap-2">
            {dictionaryData.phonetic && (
              <span className="text-gray-300 text-sm bg-gray-800/50 px-2 py-1 rounded-lg">
                /{dictionaryData.phonetic}/
              </span>
            )}
            {getFirstAudioUrl(dictionaryData.phonetics) && (
              <button
                onClick={() => playAudio(getFirstAudioUrl(dictionaryData.phonetics)!)}
                disabled={!!playingAudio}
                className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
              >
                {playingAudio ? (
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414-1.414m-1.414-2.829a5 5 0 010 7.072m0-9.9a9 9 0 0112.728 0" />
                  </svg>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-3"></div>
          <p className="text-cyan-400 text-sm">در حال دریافت اطلاعات از دیکشنری...</p>
          <p className="text-gray-500 text-xs mt-1">کلمه: "{word}"</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm mb-2">{error}</p>
          <p className="text-gray-500 text-xs">کلمه: "{word}"</p>
        </div>
      )}

      {/* Dictionary Data */}
      {dictionaryData && !isLoading && (
        <div className="space-y-4">
          {/* Part of Speech Tags */}
          <div className="flex flex-wrap gap-2">
            {dictionaryData.meanings?.slice(0, 3).map((meaning, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 rounded-full text-sm font-medium border border-cyan-500/30"
              >
                {meaning.partOfSpeech}
              </span>
            ))}
          </div>

          {/* Meanings */}
          <div className="space-y-4">
            {dictionaryData.meanings?.slice(0, 3).map((meaning, meaningIndex) => (
              <div key={meaningIndex} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <h4 className="text-cyan-300 font-semibold text-sm">
                    {meaning.partOfSpeech}
                  </h4>
                </div>

                {/* Definitions */}
                <div className="space-y-3">
                  {meaning.definitions?.slice(0, 4).map((def, defIndex) => (
                    <div key={defIndex} className="border-r-2 border-cyan-500/30 pr-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          {defIndex + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-200 text-sm leading-relaxed mb-2">
                            {def.definition}
                          </p>
                          
                          {/* Example */}
                          {def.example && (
                            <div className="bg-gray-900/50 rounded-lg p-3 border-r-2 border-purple-500/30 mb-2">
                              <p className="text-purple-300 text-xs font-medium mb-1">مثال کاربردی:</p>
                              <p className="text-gray-300 text-sm italic leading-relaxed">"{def.example}"</p>
                            </div>
                          )}

                          {/* Synonyms */}
                          {def.synonyms && def.synonyms.length > 0 && (
                            <div className="mt-2">
                              <p className="text-green-400 text-xs font-medium mb-1">مترادف‌ها:</p>
                              <div className="flex flex-wrap gap-1">
                                {def.synonyms.slice(0, 4).map((synonym, synonymIndex) => (
                                  <span 
                                    key={synonymIndex}
                                    className="px-2 py-1 bg-green-500/10 text-green-300 rounded text-xs hover:bg-green-500/20 transition-colors cursor-pointer border border-green-500/20"
                                    onClick={() => onWordSelect(synonym)}
                                  >
                                    {synonym}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Antonyms */}
                          {def.antonyms && def.antonyms.length > 0 && (
                            <div className="mt-2">
                              <p className="text-red-400 text-xs font-medium mb-1">متضاد‌ها:</p>
                              <div className="flex flex-wrap gap-1">
                                {def.antonyms.slice(0, 4).map((antonym, antonymIndex) => (
                                  <span 
                                    key={antonymIndex}
                                    className="px-2 py-1 bg-red-500/10 text-red-300 rounded text-xs hover:bg-red-500/20 transition-colors cursor-pointer border border-red-500/20"
                                    onClick={() => onWordSelect(antonym)}
                                  >
                                    {antonym}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* General Synonyms */}
                {meaning.synonyms && meaning.synonyms.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-700/50">
                    <p className="text-cyan-300 text-sm font-medium mb-2">مترادف‌های کلی:</p>
                    <div className="flex flex-wrap gap-1">
                      {meaning.synonyms.slice(0, 6).map((synonym, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-cyan-500/10 text-cyan-300 rounded text-xs hover:bg-cyan-500/20 transition-colors cursor-pointer border border-cyan-500/20"
                          onClick={() => onWordSelect(synonym)}
                        >
                          {synonym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Source Info */}
          {dictionaryData.sourceUrls && dictionaryData.sourceUrls.length > 0 && (
            <div className="pt-3 border-t border-gray-700/50">
              <p className="text-gray-400 text-xs">
                منبع:{" "}
                <a 
                  href={dictionaryData.sourceUrls[0]} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Wiktionary
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State - No data but no error */}
      {!dictionaryData && !isLoading && !error && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm mb-1">کلمه "{word}" را وارد کنید</p>
          <p className="text-gray-500 text-xs">اطلاعات دیکشنری اینجا نمایش داده می‌شود</p>
        </div>
      )}
    </div>
  );
}