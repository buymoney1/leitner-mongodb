// app/dashboard/media/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Upload, File, Video, Image, Music, FileText,
  Trash2, Eye, Copy, Globe, Lock, Search,
  List, Download, RefreshCw, Clock,
  Folder, X, Calendar, AlertCircle, CheckCircle2, XCircle
} from "lucide-react";

interface MediaFile {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  fileSizeMB: number;
  isPublic: boolean;
  accessLevel: string;
  tags: string[];
  category: string | null;
  views: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
  signedUrl: string | null;
  urlExpiresAt: string | null;
  publicUrl: string | null;
  storageKey: string;
  fileUrl?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function MediaManagerPage() {
  const { data: session, status } = useSession();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [uploadIsPublic, setUploadIsPublic] = useState(true);
  const [uploadTags, setUploadTags] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/media/list`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.data);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    setUploadFiles(prev => [...prev, ...newFiles]);

    const newProgress: UploadProgress[] = newFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadProgress(prev => [...prev, ...newProgress]);
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      alert("لطفا حداقل یک فایل انتخاب کنید");
      return;
    }

    // آپلود فایل‌ها به صورت موازی
    const uploadPromises = uploadFiles.map((file, index) => 
      uploadSingleFile(file, index)
    );

    try {
      await Promise.all(uploadPromises);
      alert("آپلود تمام فایل‌ها با موفقیت انجام شد");
      setUploadFiles([]);
      setUploadProgress([]);
      fetchFiles();
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const uploadSingleFile = async (file: File, index: number) => {
    // به روزرسانی وضعیت به در حال آپلود
    setUploadProgress(prev => prev.map((item, i) => 
      i === index ? { ...item, status: 'uploading', progress: 0 } : item
    ));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("isPublic", uploadIsPublic.toString());
    formData.append("tags", uploadTags);
    formData.append("category", uploadCategory);

    try {
      const xhr = new XMLHttpRequest();
      
      // ردیابی پیشرفت
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => prev.map((item, i) => 
            i === index ? { ...item, progress } : item
          ));
        }
      });

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              setUploadProgress(prev => prev.map((item, i) => 
                i === index ? { ...item, status: 'completed', progress: 100 } : item
              ));
              resolve(data);
            } else {
              setUploadProgress(prev => prev.map((item, i) => 
                i === index ? { 
                  ...item, 
                  status: 'error', 
                  error: data.error || 'آپلود ناموفق' 
                } : item
              ));
              reject(new Error(data.error || 'آپلود ناموفق'));
            }
          } else {
            setUploadProgress(prev => prev.map((item, i) => 
              i === index ? { 
                ...item, 
                status: 'error', 
                error: 'خطای سرور' 
              } : item
            ));
            reject(new Error('خطای سرور'));
          }
        };

        xhr.onerror = () => {
          setUploadProgress(prev => prev.map((item, i) => 
            i === index ? { 
              ...item, 
              status: 'error', 
              error: 'خطای شبکه' 
            } : item
          ));
          reject(new Error('خطای شبکه'));
        };
      });

      xhr.open("POST", "/api/media");
      xhr.send(formData);

      await uploadPromise;
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw error;
    }
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این فایل را حذف کنید؟")) return;

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        alert("فایل با موفقیت حذف شد");
        fetchFiles();
      }
    } catch (error) {
      alert("خطا در حذف فایل");
    }
  };

  const handleCopyLink = async (file: MediaFile) => {
    try {
      const response = await fetch(`/api/media/${file.id}`);
      const data = await response.json();
      
      if (data.success && data.data.fileUrl) {
        await navigator.clipboard.writeText(data.data.fileUrl);
        alert("لینک کپی شد");
      }
    } catch (error) {
      alert("خطا در دریافت لینک");
    }
  };

  const handlePreview = async (file: MediaFile) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "video": return <Video className="w-5 h-5" />;
      case "audio": return <Music className="w-5 h-5" />;
      case "image": return <Image className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getColorStyles = (type: string) => {
    const colors = {
      video: { border: "border-rose-500/20", bg: "bg-rose-500/5", text: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-500/10" },
      audio: { border: "border-emerald-500/20", bg: "bg-emerald-500/5", text: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-500/10" },
      image: { border: "border-violet-500/20", bg: "bg-violet-500/5", text: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-500/10" },
      document: { border: "border-amber-500/20", bg: "bg-amber-500/5", text: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-500/10" },
    };
    return colors[type as keyof typeof colors] || colors.document;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getExpiryStatus = (file: MediaFile) => {
    if (file.isPublic) {
      return {
        text: "دائمی",
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-500/10",
        icon: <Globe className="w-3 h-3" />
      };
    }

    if (!file.urlExpiresAt) {
      return {
        text: "نامشخص",
        color: "text-gray-600 dark:text-gray-400",
        bg: "bg-gray-500/10",
        icon: <AlertCircle className="w-3 h-3" />
      };
    }

    const expiryDate = new Date(file.urlExpiresAt);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return {
        text: "منقضی شده",
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-500/10",
        icon: <Clock className="w-3 h-3" />
      };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    let text = "";
    if (diffDays > 0) {
      text = `${diffDays} روز`;
    } else if (diffHours > 0) {
      text = `${diffHours} ساعت`;
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      text = `${diffMinutes} دقیقه`;
    }

    return {
      text: text,
      color: diffDays > 2 ? "text-green-600 dark:text-green-400" : 
             diffDays > 0 ? "text-amber-600 dark:text-amber-400" : 
             "text-red-600 dark:text-red-400",
      bg: diffDays > 2 ? "bg-green-500/10" : 
          diffDays > 0 ? "bg-amber-500/10" : 
          "bg-red-500/10",
      icon: <Clock className="w-3 h-3" />
    };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بایت';
    const k = 1024;
    const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    if (filterType !== "all" && file.fileType !== filterType) return false;
    if (search && !file.originalName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 text-center">
        <p className="mb-4 text-gray-500">لطفا برای دسترسی به مدیریت فایل‌ها وارد شوید</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="
        fixed inset-0 
        bg-[linear-gradient(to_right,#e5e5e5_0.5px,transparent_0.5px),linear-gradient(to_bottom,#e5e5e5_0.5px,transparent_0.5px)] 
        dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]
        bg-[size:24px_24px] 
        pointer-events-none 
        opacity-20
        dark:opacity-100
      " />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">مدیریت فایل‌ها</h1>
          <p className="text-gray-500 dark:text-gray-400">
            آپلود، مدیریت و مشاهده فایل‌های رسانه‌ای شما
          </p>
        </header>

        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 mb-8 shadow-lg border border-gray-200 dark:border-gray-700/50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            آپلود فایل جدید
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                انتخاب فایل‌ها (چندتایی)
              </label>
              <input
                type="file"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                multiple
              />
              
              {uploadFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadFiles.map((file, index) => {
                    const progress = uploadProgress[index];
                    return (
                      <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm truncate">{file.name}</span>
                          <button
                            onClick={() => removeUploadFile(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>{formatFileSize(file.size)}</span>
                          <span>
                            {progress?.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500 inline mr-1" />}
                            {progress?.status === 'error' && <XCircle className="w-4 h-4 text-red-500 inline mr-1" />}
                            {progress?.status}
                          </span>
                        </div>
                        
                        {progress?.status === 'uploading' && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress.progress}%` }}
                            />
                          </div>
                        )}
                        
                        {progress?.status === 'uploading' && (
                          <div className="text-right text-xs text-gray-500 mt-1">
                            {progress.progress}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadIsPublic}
                    onChange={(e) => setUploadIsPublic(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-sm">دسترسی عمومی</span>
                  {uploadIsPublic ? (
                    <Globe className="w-4 h-4 text-green-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {uploadIsPublic ? "لینک دائمی عمومی" : "لینک خصوصی با مدت محدود"}
                </p>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="تگ‌ها (با کاما جدا کنید)"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-1 focus:ring-cyan-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="دسته‌بندی (اختیاری)"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-1 focus:ring-cyan-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setUploadFiles([]);
                setUploadProgress([]);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              پاک کردن لیست
            </button>
            
            <button
              onClick={handleUpload}
              disabled={uploadFiles.length === 0 || uploadProgress.some(p => p.status === 'uploading')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl font-medium hover:from-cyan-700 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              آپلود فایل‌ها
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="جستجوی فایل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            >
              <option value="all">همه انواع</option>
              <option value="video">ویدیو</option>
              <option value="audio">صوت</option>
              <option value="image">تصویر</option>
              <option value="document">سند</option>
            </select>

            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {viewMode === "grid" ? "جدول" : "کارت"}
            </button>

            <button
              onClick={fetchFiles}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Folder className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>هیچ فایلی یافت نشد</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="p-4 text-right text-sm font-medium">نام فایل</th>
                  <th className="p-4 text-right text-sm font-medium">نوع</th>
                  <th className="p-4 text-right text-sm font-medium">حجم</th>
                  <th className="p-4 text-right text-sm font-medium">وضعیت لینک</th>
                  <th className="p-4 text-right text-sm font-medium">تاریخ آپلود</th>
                  <th className="p-4 text-right text-sm font-medium">تاریخ انقضا</th>
                  <th className="p-4 text-right text-sm font-medium">بازدید</th>
                  <th className="p-4 text-right text-sm font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file, index) => {
                  const colors = getColorStyles(file.fileType);
                  const expiryStatus = getExpiryStatus(file);
                  
                  return (
                    <tr 
                      key={file.id}
                      className={`border-t border-gray-200 dark:border-gray-700/30 ${
                        index % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                            {getFileIcon(file.fileType)}
                          </div>
                          <div>
                            <div className="font-medium truncate max-w-xs">{file.originalName}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {file.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="ml-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                          {file.fileType}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{file.fileSizeMB.toFixed(2)} MB</td>
                      <td className="p-4">
                        <div className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${expiryStatus.bg} ${expiryStatus.color}`}>
                          {expiryStatus.icon}
                          <span>{expiryStatus.text}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {file.isPublic ? "عمومی" : "خصوصی"}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(file.createdAt)}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {file.isPublic ? (
                          <span className="text-green-600 dark:text-green-400">دائمی</span>
                        ) : file.urlExpiresAt ? (
                          formatDate(file.urlExpiresAt)
                        ) : (
                          <span className="text-gray-500">نامشخص</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Eye className="w-4 h-4" />
                          {file.views}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreview(file)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="مشاهده"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCopyLink(file)}
                            className="p-2 hover:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg"
                            title="کپی لینک"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file) => {
              const colors = getColorStyles(file.fileType);
              const expiryStatus = getExpiryStatus(file);
              
              return (
                <div
                  key={file.id}
                  className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className={`p-4 ${colors.bg} border-b ${colors.border}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                        {getFileIcon(file.fileType)}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${expiryStatus.bg} ${expiryStatus.color}`}>
                          {expiryStatus.icon}
                          <span>{expiryStatus.text}</span>
                        </div>
                        {file.isPublic ? (
                          <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
                            عمومی
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-gray-500/10 text-gray-600 dark:text-gray-400 rounded-full">
                            خصوصی
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="font-medium truncate" title={file.originalName}>
                      {file.originalName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {file.fileSizeMB.toFixed(2)} MB • {file.fileType}
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>آپلود: {formatDate(file.createdAt)}</span>
                        </div>
                      </div>
                      
                      {!file.isPublic && file.urlExpiresAt && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>انقضا: {formatDate(file.urlExpiresAt)}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{file.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>{file.downloads}</span>
                        </div>
                      </div>
                    </div>

                    {file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 my-4">
                        {file.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreview(file)}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        مشاهده
                      </button>
                      <button
                        onClick={() => handleCopyLink(file)}
                        className="flex-1 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <Copy className="w-4 h-4" />
                        کپی لینک
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showPreview && selectedFile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-semibold">{selectedFile.originalName}</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-auto max-h-[70vh]">
                {selectedFile.fileType === "image" ? (
                  <img
                    src={selectedFile.fileUrl || ""}
                    alt={selectedFile.originalName}
                    className="max-w-full h-auto rounded-lg mx-auto"
                  />
                ) : selectedFile.fileType === "video" ? (
                  <video
                    controls
                    className="w-full rounded-lg"
                    src={selectedFile.fileUrl}
                  />
                ) : selectedFile.fileType === "audio" ? (
                  <audio
                    controls
                    className="w-full"
                    src={selectedFile.fileUrl}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>پیش‌نمایش برای این نوع فایل در دسترس نیست</p>
                    <a
                      href={selectedFile.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                      دانلود فایل
                    </a>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">نوع فایل</div>
                    <div className="font-medium">{selectedFile.mimeType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">حجم</div>
                    <div className="font-medium">{selectedFile.fileSizeMB.toFixed(2)} MB</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">تاریخ آپلود</div>
                    <div className="font-medium">{formatDate(selectedFile.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">وضعیت لینک</div>
                    <div className="font-medium">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getExpiryStatus(selectedFile).bg} ${getExpiryStatus(selectedFile).color}`}>
                        {getExpiryStatus(selectedFile).icon}
                        <span>{getExpiryStatus(selectedFile).text}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!selectedFile.isPublic && selectedFile.urlExpiresAt && (
                    <>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">تاریخ انقضا</div>
                        <div className="font-medium">{formatDate(selectedFile.urlExpiresAt)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">نوع دسترسی</div>
                        <div className="font-medium">خصوصی</div>
                      </div>
                    </>
                  )}
                  
                  {selectedFile.isPublic && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">نوع دسترسی</div>
                      <div className="font-medium text-green-600 dark:text-green-400">عمومی</div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">بازدید</div>
                    <div className="font-medium">{selectedFile.views} بار</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}