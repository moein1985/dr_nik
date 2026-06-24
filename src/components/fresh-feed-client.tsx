"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getTRPCClient } from "@/trpc/client";

type FreshPost = {
  id: string;
  mediaType: string;
  mediaUrl: string;
  caption: string | null;
  createdAt: Date;
  _count?: {
    likes: number;
    comments: number;
  };
};

type FreshPostDetails = FreshPost & {
  author: {
    id: string;
    username: string | null;
  };
  likes: Array<{
    id: string;
    userId: string;
  }>;
  comments: Array<{
    id: string;
    userId: string;
    content: string;
    createdAt: Date;
    user: {
      username: string | null;
    };
  }>;
};

type FreshFeedClientProps = {
  locale: Locale;
};

export function FreshFeedClient({ locale }: FreshFeedClientProps) {
  const [posts, setPosts] = useState<FreshPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<FreshPostDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");

  const t = (key: string) => {
    const translations: Record<string, Record<Locale, string>> = {
      title: { fa: "تازه‌ها", en: "Fresh", ar: "جديد" },
      loading: { fa: "در حال بارگذاری...", en: "Loading...", ar: "جاري التحميل..." },
      noPosts: { fa: "هیچ پستی یافت نشد", en: "No posts found", ar: "لم يتم العثور على منشورات" },
      likes: { fa: "لایک", en: "Likes", ar: "إعجابات" },
      comments: { fa: "کامنت", en: "Comments", ar: "تعليقات" },
      like: { fa: "لایک", en: "Like", ar: "إعجاب" },
      unlike: { fa: "حذف لایک", en: "Unlike", ar: "إلغاء الإعجاب" },
      viewDetails: { fa: "مشاهده جزئیات", en: "View Details", ar: "عرض التفاصيل" },
      close: { fa: "بستن", en: "Close", ar: "إغلاق" },
      addComment: { fa: "افزودن کامنت", en: "Add Comment", ar: "إضافة تعليق" },
      writeComment: { fa: "نظر خود را بنویسید...", en: "Write your comment...", ar: "اكتب تعليقك..." },
      send: { fa: "ارسال", en: "Send", ar: "إرسال" },
      loginRequired: { fa: "برای لایک و کامنت باید وارد شوید", en: "Login required to like and comment", ar: "تسجيل الدخول مطلوب للإعجاب والتعليق" },
    };
    return translations[key]?.[locale] ?? key;
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const trpc = getTRPCClient();
      const result = await trpc.fresh.list.query({ limit: 50 });
      setPosts(result);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPostDetails = async (postId: string) => {
    try {
      const trpc = getTRPCClient();
      const result = await trpc.fresh.getById.query({ id: postId });
      setSelectedPost(result);
    } catch (error) {
      console.error("Failed to fetch post details:", error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const trpc = getTRPCClient();
      await trpc.fresh.toggleLike.mutate({ postId });
      void fetchPosts();
      if (selectedPost?.id === postId) {
        void fetchPostDetails(postId);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      alert(t("loginRequired"));
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;
    try {
      const trpc = getTRPCClient();
      await trpc.fresh.addComment.mutate({ postId, content: commentText });
      setCommentText("");
      void fetchPostDetails(postId);
    } catch (error) {
      console.error("Failed to add comment:", error);
      alert(t("loginRequired"));
    }
  };

  useEffect(() => {
    void fetchPosts();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-SA" : "en-US");
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>

      {isLoading ? (
        <p className="text-center text-muted-foreground">{t("loading")}</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-muted-foreground">{t("noPosts")}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.id} className="overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
              {post.mediaType === "IMAGE" ? (
                <img src={post.mediaUrl} alt={post.caption ?? ""} className="h-64 w-full object-cover" />
              ) : (
                <video src={post.mediaUrl} className="h-64 w-full object-cover" controls />
              )}
              <div className="p-4">
                {post.caption && <p className="mb-3 text-sm">{post.caption}</p>}
                <div className="mb-3 flex gap-4 text-sm text-muted-foreground">
                  <span>❤️ {post._count?.likes ?? 0}</span>
                  <span>💬 {post._count?.comments ?? 0}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex-1 rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {t("like")}
                  </button>
                  <button
                    onClick={() => fetchPostDetails(post.id)}
                    className="flex-1 rounded bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/80"
                  >
                    {t("viewDetails")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for post details */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedPost(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedPost.author.username ?? "User"}</h2>
              <button onClick={() => setSelectedPost(null)} className="text-2xl text-gray-900 dark:text-white">&times;</button>
            </div>

            {selectedPost.mediaType === "IMAGE" ? (
              <img src={selectedPost.mediaUrl} alt={selectedPost.caption ?? ""} className="mb-4 w-full rounded" />
            ) : (
              <video src={selectedPost.mediaUrl} className="mb-4 w-full rounded" controls />
            )}

            {selectedPost.caption && <p className="mb-4 text-gray-900 dark:text-white">{selectedPost.caption}</p>}

            <div className="mb-4 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>❤️ {selectedPost.likes.length} {t("likes")}</span>
              <span>💬 {selectedPost.comments.length} {t("comments")}</span>
            </div>

            <button
              onClick={() => handleLike(selectedPost.id)}
              className="mb-4 w-full rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("like")}
            </button>

            <div className="mb-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">{t("comments")}</h3>
              <div className="space-y-3">
                {selectedPost.comments.map((comment) => (
                  <div key={comment.id} className="rounded bg-gray-100 p-3 dark:bg-gray-800">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.user.username ?? "User"}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{t("addComment")}</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t("writeComment")}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleComment(selectedPost.id);
                    }
                  }}
                />
                <button
                  onClick={() => handleComment(selectedPost.id)}
                  className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {t("send")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
