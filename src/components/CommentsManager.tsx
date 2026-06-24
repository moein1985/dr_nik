"use client";
import { useState, useEffect } from 'react';
import { getTRPCClient } from '@/trpc/client';
import { Trash2, Edit2, Search } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  userId: string;
  username: string | null;
  postId: string;
  postCaption: string | null;
  createdAt: Date;
}

interface CommentsManagerProps {
  locale: string;
}

export function CommentsManager({ locale }: CommentsManagerProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState({ postId: '', userId: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const translations: Record<string, Record<string, string>> = {
    title: { fa: 'مدیریت کامنت‌ها', en: 'Comments Management', ar: 'إدارة التعليقات' },
    filterPost: { fa: 'فیلتر با ID پست', en: 'Filter by Post ID', ar: 'تصفية بمعرف المشاركة' },
    filterUser: { fa: 'فیلتر با ID کاربر', en: 'Filter by User ID', ar: 'تصفية بمعرف المستخدم' },
    user: { fa: 'کاربر', en: 'User', ar: 'المستخدم' },
    post: { fa: 'پست', en: 'Post', ar: 'المشاركة' },
    content: { fa: 'محتوا', en: 'Content', ar: 'المحتوى' },
    date: { fa: 'تاریخ', en: 'Date', ar: 'التاريخ' },
    actions: { fa: 'عملیات', en: 'Actions', ar: 'الإجراءات' },
    loading: { fa: 'در حال بارگذاری...', en: 'Loading...', ar: 'جاري التحميل...' },
    noComments: { fa: 'هیچ کامنتی یافت نشد', en: 'No comments found', ar: 'لم يتم العثور على تعليقات' },
    confirmDelete: { fa: 'آیا مطمئن هستید؟', en: 'Are you sure?', ar: 'هل أنت متأكد؟' },
  };

  const t = (key: string) => translations[key]?.[locale] || key;

  const fetchComments = async () => {
    setLoading(true);
    try {
      const trpc = getTRPCClient();
      const result = await trpc.fresh.listAllComments.query({
        postId: filter.postId || undefined,
        userId: filter.userId || undefined,
        limit: 50,
      });
      setComments(result);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchComments(); }, []);

  const handleUpdate = async (commentId: string, content: string) => {
    try {
      const trpc = getTRPCClient();
      await trpc.fresh.updateComment.mutate({ commentId, content });
      setEditing(null);
      void fetchComments();
    } catch (error) {
      console.error('Failed to update comment:', error);
      alert('خطا در ویرایش کامنت');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      const trpc = getTRPCClient();
      await trpc.fresh.deleteComment.mutate({ commentId });
      void fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('خطا در حذف کامنت');
    }
  };

  const formatDate = (date: Date) => {
    if (locale === 'fa') {
      return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    } else if (locale === 'ar') {
      return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    }
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">{t('title')}</h3>
      
      <div className="flex gap-2">
        <input
          placeholder={t('filterPost')}
          value={filter.postId}
          onChange={(e) => setFilter({ ...filter, postId: e.target.value })}
          className="rounded border px-3 py-2 flex-1"
        />
        <input
          placeholder={t('filterUser')}
          value={filter.userId}
          onChange={(e) => setFilter({ ...filter, userId: e.target.value })}
          className="rounded border px-3 py-2 flex-1"
        />
        <button 
          onClick={fetchComments} 
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Search size={16} />
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">{t('loading')}</p>
      ) : comments.length === 0 ? (
        <p className="text-center text-gray-500">{t('noComments')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">{t('user')}</th>
                <th className="px-4 py-2 text-left">{t('post')}</th>
                <th className="px-4 py-2 text-left">{t('content')}</th>
                <th className="px-4 py-2 text-left">{t('date')}</th>
                <th className="px-4 py-2 text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id} className="border-b">
                  <td className="px-4 py-2">{comment.username || 'Unknown'}</td>
                  <td className="px-4 py-2 truncate max-w-xs">{comment.postCaption || 'No caption'}</td>
                  <td className="px-4 py-2">
                    {editing === comment.id ? (
                      <input
                        defaultValue={comment.content}
                        onBlur={(e) => handleUpdate(comment.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdate(comment.id, e.currentTarget.value);
                          }
                        }}
                        className="w-full rounded border px-2 py-1"
                        autoFocus
                      />
                    ) : (
                      comment.content
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setEditing(comment.id)}
                      className="mr-2 text-blue-600 hover:text-blue-700"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
