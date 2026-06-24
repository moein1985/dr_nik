"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getTRPCClient } from "@/trpc/client";
import { getDictionary } from "@/i18n/dictionary";
import { FileUploadSection } from "@/components/FileUploadSection";
import { CommentsManager } from "@/components/CommentsManager";

type FreshPost = {
  id: string;
  mediaType: string;
  mediaUrl: string;
  caption: string | null;
  status: string;
  createdAt: Date;
  _count?: {
    likes: number;
    comments: number;
  };
};

type ContentManagerPanelProps = {
  locale: Locale;
};

export function ContentManagerPanel({ locale }: ContentManagerPanelProps) {
  const [posts, setPosts] = useState<FreshPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<FreshPost | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [formData, setFormData] = useState({
    mediaType: "IMAGE" as "IMAGE" | "VIDEO",
    mediaUrl: "",
    caption: "",
    status: "PUBLISHED" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
  });
  const dict = getDictionary(locale);

  const t = (key: string) => {
    const translations: Record<string, Record<Locale, string>> = {
      title: { fa: "مدیریت محتوای تازه‌ها", en: "Fresh Content Management", ar: "إدارة المحتوى الجديد" },
      postsTab: { fa: "پست‌ها", en: "Posts", ar: "المشاركات" },
      commentsTab: { fa: "کامنت‌ها", en: "Comments", ar: "التعليقات" },
      createNew: { fa: "ایجاد پست جدید", en: "Create New Post", ar: "إنشاء منشور جديد" },
      mediaType: { fa: "نوع رسانه:", en: "Media Type:", ar: "نوع الوسائط:" },
      image: { fa: "تصویر", en: "Image", ar: "صورة" },
      video: { fa: "ویدیو", en: "Video", ar: "فيديو" },
      mediaUrl: { fa: "URL رسانه:", en: "Media URL:", ar: "رابط الوسائط:" },
      caption: { fa: "توضیحات:", en: "Caption:", ar: "التسمية التوضيحية:" },
      status: { fa: "وضعیت:", en: "Status:", ar: "الحالة:" },
      draft: { fa: "پیش‌نویس", en: "Draft", ar: "مسودة" },
      published: { fa: "منتشر شده", en: "Published", ar: "منشور" },
      archived: { fa: "بایگانی شده", en: "Archived", ar: "مؤرشف" },
      save: { fa: "ذخیره", en: "Save", ar: "حفظ" },
      cancel: { fa: "انصراف", en: "Cancel", ar: "إلغاء" },
      edit: { fa: "ویرایش", en: "Edit", ar: "تعديل" },
      delete: { fa: "حذف", en: "Delete", ar: "حذف" },
      loading: { fa: "در حال بارگذاری...", en: "Loading...", ar: "جاري التحميل..." },
      noPosts: { fa: "هیچ پستی یافت نشد", en: "No posts found", ar: "لم يتم العثور على منشورات" },
      likes: { fa: "لایک", en: "Likes", ar: "إعجابات" },
      comments: { fa: "کامنت", en: "Comments", ar: "تعليقات" },
      confirmDelete: { fa: "آیا مطمئن هستید؟", en: "Are you sure?", ar: "هل أنت متأكد؟" },
    };
    return translations[key]?.[locale] ?? key;
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const trpc = getTRPCClient();
      console.log("Fetching posts with listAll...");
      const result = await trpc.fresh.listAll.query({ limit: 50 });
      console.log("Fetched posts:", result);
      setPosts(result);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const trpc = getTRPCClient();
      if (editingPost) {
        await trpc.fresh.update.mutate({
          id: editingPost.id,
          ...formData,
        });
      } else {
        await trpc.fresh.create.mutate(formData);
      }
      setShowForm(false);
      setEditingPost(null);
      setFormData({ mediaType: "IMAGE", mediaUrl: "", caption: "", status: "PUBLISHED" });
      void fetchPosts();
    } catch (error) {
      console.error("Failed to save post:", error);
      const errorMessage = error instanceof Error ? error.message : dict.contentManager.errorSavingPost;
      alert(errorMessage);
    }
  };

  const handleEdit = (post: FreshPost) => {
    setEditingPost(post);
    setFormData({
      mediaType: post.mediaType as "IMAGE" | "VIDEO",
      mediaUrl: post.mediaUrl,
      caption: post.caption ?? "",
      status: post.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    });
    setShowForm(true);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      const trpc = getTRPCClient();
      await trpc.fresh.delete.mutate({ id: postId });
      void fetchPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert(dict.contentManager.errorDeletingPost);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              activeTab === 'posts' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {t("postsTab")}
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              activeTab === 'comments' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {t("commentsTab")}
          </button>
        </div>
      </div>

      {activeTab === 'posts' && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingPost(null);
                setFormData({ mediaType: "IMAGE", mediaUrl: "", caption: "", status: "PUBLISHED" });
              }}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("createNew")}
            </button>
          </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-md border bg-muted/20 p-4">
          <div className="grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">{t("mediaType")}</label>
              <select
                value={formData.mediaType}
                onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as "IMAGE" | "VIDEO" })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="IMAGE">{t("image")}</option>
                <option value="VIDEO">{t("video")}</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">{t("mediaUrl")}</label>
              <FileUploadSection 
                onUpload={(url) => setFormData({ ...formData, mediaUrl: url })}
                currentUrl={formData.mediaUrl}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">{t("caption")}</label>
              <textarea
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                maxLength={500}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">{t("status")}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED" })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="DRAFT">{t("draft")}</option>
                <option value="PUBLISHED">{t("published")}</option>
                <option value="ARCHIVED">{t("archived")}</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {t("save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPost(null);
                }}
                className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-center text-muted-foreground">{t("loading")}</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-muted-foreground">{t("noPosts")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.id} className="overflow-hidden rounded-lg border bg-card">
              {post.mediaType === "IMAGE" ? (
                <img src={post.mediaUrl} alt={post.caption ?? ""} className="h-48 w-full object-cover" />
              ) : (
                <video src={post.mediaUrl} className="h-48 w-full object-cover" controls />
              )}
              <div className="p-4">
                {post.caption && <p className="mb-2 text-sm">{post.caption}</p>}
                <div className="mb-2 flex gap-4 text-xs text-muted-foreground">
                  <span>{post._count?.likes ?? 0} {t("likes")}</span>
                  <span>{post._count?.comments ?? 0} {t("comments")}</span>
                  <span className={`font-medium ${post.status === "PUBLISHED" ? "text-green-600" : post.status === "DRAFT" ? "text-yellow-600" : "text-gray-600"}`}>
                    {t(post.status.toLowerCase())}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                  >
                    {t("edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                  >
                    {t("delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      )}

      {activeTab === 'comments' && (
        <CommentsManager locale={locale} />
      )}
    </div>
  );
}
