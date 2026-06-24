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
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string | null } | undefined>();

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
      
      // Fetch details for each post to get author, likes, and comments
      const postsWithDetails = await Promise.all(
        result.map(async (post) => {
          try {
            const details = await trpc.fresh.getById.query({ id: post.id });
            return details as FreshPostWithDetails;
          } catch (error) {
            console.error(`Failed to fetch details for post ${post.id}:`, error);
            return post as unknown as FreshPostWithDetails;
          }
        })
      );
      
      setPosts(postsWithDetails);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
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
      alert(t("loginRequired"));
      // Revert on error
      void fetchPosts();
    }
  };

  const handleComment = async (postId: string, content: string) => {
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
                  user: { id: currentUser?.id || "", username: currentUser?.username || null },
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
      alert(t("loginRequired"));
    }
  };

  useEffect(() => {
    void fetchCurrentUser();
    void fetchPosts();
  }, []);

  return (
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
  );
}
