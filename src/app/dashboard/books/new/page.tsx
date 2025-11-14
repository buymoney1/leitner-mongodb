"use client";

import { useState } from "react";

export default function NewBookPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("/api/books/create", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    });

    alert("کتاب ساخته شد!");
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">➕ افزودن کتاب جدید</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-3 rounded bg-gray-800 border border-gray-700"
          placeholder="عنوان کتاب"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-3 rounded bg-gray-800 border border-gray-700"
          placeholder="توضیحات"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded">
          ذخیره
        </button>
      </form>
    </div>
  );
}
