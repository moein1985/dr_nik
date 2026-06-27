"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getTRPCClient } from "@/trpc/client";
import PostCard from "./fresh/PostCard";
import type { FreshPostWithDetails } from "@/server/modules/fresh/infrastructure/fresh.repository";

type FreshFeedClientProps = {
  locale: Locale;
};

export function FreshFeedClient({ locale }: FreshFeedClientProps) {
  const [posts, setPosts] = useState<FreshPostWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string | null; avatarUrl: string | null } | undefined>();
  const [loginPrompt, setLoginPrompt] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<Locale, string>> = {
      title: { fa: "تازه‌ها", en: "Fresh", ar: "جديد" },
      loading: { fa: "در حال بارگذاری...", en: "Loading...", ar: "جاري التحميل..." },
      noPosts: { fa: "هیچ پستی یافت نشد", en: "No posts found", ar: "لم يتم العثور على منشورات" },
      loginRequired: { fa: "برای لایک و کامنت باید وارد شوید", en: "Login required to like and comment", ar: "تسجيل الدخول مطلوب للإعجاب والتعليق" },
    };
    return translations[key]?.[locale] ?? key;
  };

  const fetchCurrentUser = async () => {
    try {
      const trpc = getTRPCClient();
      const result = await trpc.auth.me.query();
      setCurrentUser({
        id: result.id,
        username: result.username ?? null,
        avatarUrl: (result as { avatarUrl?: string | null }).avatarUrl ?? null,
      });
    } catch (error) {
      // User not logged in
      setCurrentUser(undefined);
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const trpc = getTRPCClient();
      const result = await trpc.fresh.list.query({ limit: 50 });
      setPosts(result as FreshPostWithDetails[]);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      setLoginPrompt(true);
      setTimeout(() => setLoginPrompt(false), 3000);
      return;
    }
    try {
      const trpc = getTRPCClient();
      await trpc.fresh.toggleLike.mutate({ postId });
      // Optimistically update the post
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const isLiked = post.likes.some((like) => like.userId === currentUser?.id);
            const updatedLikes = isLiked
              ? post.likes.filter((like) => like.userId !== currentUser?.id)
              : [...post.likes, { id: crypto.randomUUID(), userId: currentUser?.id || "" }];
            return {
              ...post,
              likes: updatedLikes,
              _count: {
                likes: updatedLikes.length,
                comments: post._count?.comments || 0,
              },
            } as FreshPostWithDetails;
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Don't show alert - the operation might have succeeded on server
      // Just refresh to get the correct state
      void fetchPosts();
    }
  };

  const handleComment = async (postId: string, content: string) => {
    if (!currentUser) {
      setLoginPrompt(true);
      setTimeout(() => setLoginPrompt(false), 3000);
      return;
    }
    try {
      const trpc = getTRPCClient();
      await trpc.fresh.addComment.mutate({ postId, content });
      // Refresh the specific post
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: crypto.randomUUID(),
                  userId: currentUser?.id || "",
                  content,
                  user: { id: currentUser?.id || "", username: currentUser?.username || null, avatarUrl: currentUser?.avatarUrl ?? null },
                  createdAt: new Date(),
                },
              ],
              _count: {
                likes: post._count?.likes || 0,
                comments: (post._count?.comments || 0) + 1,
              },
            } as FreshPostWithDetails;
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Failed to add comment:", error);
      // Don't show alert - the operation might have succeeded on server
      // Just refresh to get the correct state
      void fetchPosts();
    }
  };

  useEffect(() => {
    void fetchCurrentUser();
    void fetchPosts();
  }, []);

  return (
    <>
      {loginPrompt && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-6 py-4 text-sm text-amber-800 dark:text-amber-200 shadow-lg">
            {t("loginRequired")}
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-6">
        <div className="max-w-[600px] mx-auto px-4">
          <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>

          {isLoading ? (
            <p className="text-center text-gray-600 dark:text-gray-400">{t("loading")}</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">{t("noPosts")}</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  currentUser={currentUser}
                  isLiked={post.likes.some((like) => like.userId === currentUser?.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
