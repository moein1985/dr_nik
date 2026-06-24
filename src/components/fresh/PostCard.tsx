import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import Avatar from './Avatar';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: {
    id: string;
    author: {
      id: string;
      username: string | null;
    };
    mediaType: string;
    mediaUrl: string;
    caption: string | null;
    createdAt: Date;
    likes: Array<{ id: string; userId: string }>;
    comments: Array<{
      id: string;
      content: string;
      user: { id: string; username: string | null };
      createdAt: Date;
    }>;
    _count?: {
      likes: number;
      comments: number;
    };
  };
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  currentUser?: {
    id: string;
    username: string | null;
  };
  isLiked?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  currentUser,
  isLiked = false,
}) => {
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleLike = () => {
    setIsLikedState(!isLikedState);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    onLike(post.id);
  };

  const handleComment = (postId: string, content: string) => {
    onComment(postId, content);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const captionLines = post.caption?.split('\n') || [];
  const shouldTruncateCaption = !isCaptionExpanded && captionLines.length > 3;

  return (
    <div className="max-w-[600px] mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm mb-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Avatar username={post.author.username || undefined} size={40} />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {post.author.username || 'Unknown User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Media */}
      <div className="bg-gray-100 dark:bg-gray-800">
        {post.mediaType === 'IMAGE' ? (
          <img
            src={post.mediaUrl}
            alt={post.caption || 'Post'}
            className="w-full max-h-[600px] object-cover"
          />
        ) : (
          <video
            src={post.mediaUrl}
            className="w-full max-h-[600px] object-cover"
            controls
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-3">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={handleLike}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-transform ${
              isAnimating ? 'scale-125' : ''
            }`}
          >
            <Heart
              className={`w-6 h-6 ${
                isLikedState ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'
              }`}
            />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <MessageCircle className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <Share2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Stats */}
        <div className="mb-2">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            {post._count?.likes || post.likes.length} likes
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(post.createdAt)}
          </p>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="mb-2">
            <p className="text-sm text-gray-900 dark:text-white">
              <span className="font-semibold mr-1">
                {post.author.username || 'Unknown User'}
              </span>
              {shouldTruncateCaption
                ? captionLines.slice(0, 3).join('\n')
                : post.caption}
            </p>
            {shouldTruncateCaption && (
              <button
                onClick={() => setIsCaptionExpanded(true)}
                className="text-sm text-gray-500 dark:text-gray-400 mt-1"
              >
                more
              </button>
            )}
          </div>
        )}

        {/* Comments */}
        <CommentSection
          postId={post.id}
          comments={post.comments}
          totalComments={post._count?.comments || post.comments.length}
          onAddComment={handleComment}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default PostCard;
