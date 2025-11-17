// components/video/AdminVideoUploadForm.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

// لیست سطوح را از enum می‌گیریم تا در منو نمایش دهیم
const videoLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function AdminVideoUploadForm() {
  // 1. status را هم از useSession بگیرید
  const { data: session, status } = useSession(); 
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [level, setLevel] = useState('A1');
  const [subtitlesText, setSubtitlesText] = useState('');
  const [message, setMessage] = useState('');
  const [vocabularyText, setVocabularyText] = useState(''); 

  // 2. اگر در حال بارگذاری است، یک پیام یا اسپینر نمایش دهید
  if (status === 'loading') {
    return <div className="text-center p-4">Loading...</div>; // می‌توانید یک کامپوننت اسپینر هم قرار دهید
  }

  // 3. اگر کاربر وارد نشده یا نقشش ادمین نیست، دسترسی را رد کنید
  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return <p className="text-center p-4 text-red-600">Access Denied. Admins only.</p>;
  }
  
  // 4. اگر از مراحل بالا عبور کرد، یعنی کاربر ادمین است و فرم را نمایش بده
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const vocabularies = vocabularyText.split('\n').map(line => {
      const parts = line.split('|');
      if (parts.length < 2) return null;
      const [word, meaning] = parts;
      return {
        word: word.trim(),
        meaning: meaning.trim(),
      };
    }).filter(vocab => vocab !== null);

    // ارسال زیرنویس به صورت خام (VTT) بدون پردازش
    const response = await fetch('/api/admin/upload-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        videoUrl, 
        level, 
        subtitles: subtitlesText, // ارسال زیرنویس به صورت متن VTT خام
        vocabularies 
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('Video uploaded successfully!');
      setTitle('');
      setVideoUrl('');
      setLevel('A1'); 
      setSubtitlesText('');
      setVocabularyText('');
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload New Video</h2>
      {/* ... بقیه کد فرم بدون تغییر ... */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Title</label>
        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded" required />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="videoUrl">Video URL</label>
        <input id="videoUrl" type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full p-2 border rounded" required />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="level">
          Level
        </label>
        <select
          id="level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          {videoLevels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vocabulary">
          لغت‌ها و عبارت‌های مهم (هر خط یک مورد: لغت|معنی)
        </label>
        <textarea
          id="vocabulary"
          value={vocabularyText}
          onChange={(e) => setVocabularyText(e.target.value)}
          className="w-full p-2 border rounded h-32 font-mono text-sm"
          placeholder="Hello|سلام&#10;World|جهان&#10;How are you?|حالت چطوره؟"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subtitles">Subtitles (VTT format)</label>
        <textarea 
          id="subtitles" 
          value={subtitlesText} 
          onChange={(e) => setSubtitlesText(e.target.value)} 
          className="w-full p-2 border rounded h-48 font-mono text-sm" 
          required 
          placeholder="WEBVTT&#10;&#10;00:00:00.000 --> 00:00:03.500&#10;Hello, how are you?&#10;سلام، حال شما چطور است؟&#10;&#10;00:00:03.500 --> 00:00:06.000&#10;I am fine, thank you.&#10;من خوبم، ممنون." 
        />
      </div>
      <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Upload Video
      </button>
      {message && <p className={`mt-4 ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
    </form>
  );
}