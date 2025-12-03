import { useState, useEffect } from 'react';
import { CloseIcon, SaveIcon, TranslateIcon } from './icons';
import DictionarySection from './DictionarySection';

interface SaveWordPopupProps {
  word: string;
  onClose: () => void;
  onSave: (word: string, meaning: string) => Promise<void>;
}

export default function SaveWordPopup({ word, onClose, onSave }: SaveWordPopupProps) {
  const [meaning, setMeaning] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState(word);

  useEffect(() => {
    if (word.trim()) {
      autoTranslateWord(word);
    }
  }, [word]);

  const autoTranslateWord = async (wordToTranslate: string) => {
    if (!wordToTranslate.trim()) return;
    
    setIsTranslating(true);
    try {
      const response = await fetch(`/api/translate?text=${encodeURIComponent(wordToTranslate)}&target=fa`);
      
      if (response.ok) {
        const data = await response.json();
        setMeaning(data.translatedText || "");
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!dictionaryWord.trim() || !meaning.trim()) {
      alert("لطفاً هم کلمه و هم معنی را وارد کنید.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(dictionaryWord, meaning);
      onClose();
    } catch (error) {
      console.error("Error saving word:", error);
      alert("خطا در ذخیره کلمه.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualTranslate = async () => {
    if (dictionaryWord.trim()) {
      await autoTranslateWord(dictionaryWord.trim());
    }
  };

  const handleWordSelect = (selectedWord: string) => {
    setDictionaryWord(selectedWord);
    autoTranslateWord(selectedWord);
  };

  return (
    <div className="flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">ذخیره لغت در لایتنر</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <CloseIcon />
        </button>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">کلمه انگلیسی:</label>
          <input
            type="text"
            value={dictionaryWord}
            onChange={(e) => setDictionaryWord(e.target.value)}
            placeholder="کلمه انگلیسی را وارد کنید..."
            className="w-full p-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">معنی فارسی:</label>
            <button
              onClick={handleManualTranslate}
              disabled={isTranslating || !dictionaryWord.trim()}
              className="text-blue-600 hover:text-blue-500 text-xs flex items-center gap-1 disabled:opacity-50"
            >
              {isTranslating ? (
                <>
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  در حال ترجمه...
                </>
              ) : (
                <>
                  <TranslateIcon />
                  ترجمه خودکار
                </>
              )}
            </button>
          </div>
          <input
            type="text"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder={isTranslating ? "در حال ترجمه..." : "معنی فارسی را وارد کنید..."}
            className="w-full p-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            disabled={isTranslating}
          />
          {isTranslating && (
            <div className="text-blue-600 text-xs flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              در حال ترجمه خودکار...
            </div>
          )}
        </div>

        {/* بخش دیکشنری */}
        <DictionarySection word={dictionaryWord} onWordSelect={handleWordSelect} />
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving || !dictionaryWord.trim() || !meaning.trim()}
            className={`flex-1 py-3 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              isSaving || !dictionaryWord.trim() || !meaning.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg"
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                در حال ذخیره...
              </>
            ) : (
              <>
                <SaveIcon />
                ذخیره در لایتنر
              </>
            )}
          </button>
          
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}