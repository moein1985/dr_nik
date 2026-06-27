import React, { useState } from 'react';
import Avatar from './Avatar';

interface CommentSectionProps {
  postId: string;
  comments: Array<{
    id: string;
    content: string;
    userId: string;
    user: { id: string; username: string | null; avatarUrl?: string | null };
    createdAt: Date;
  }>;
  totalComments: number;
  onAddComment: (postId: string, content: string) => void;
  currentUser?: {
    id: string;
    username: string | null;
    avatarUrl?: string | null;
  };
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  totalComments,
  onAddComment,
  currentUser,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');

  const displayedComments = isExpanded ? comments : comments.slice(0, 2);
  const hasMoreComments = comments.length > 2;

  const handleSubmit = () => {
    if (commentText.trim()) {
      onAddComment(postId, commentText.trim());
      setCommentText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="mt-3">
      {/* Comments List */}
      {comments.length > 0 && (
        <>
          {displayedComments.map((comment) => (
            <div key={comment.id} className="flex gap-2 mb-2">
              <Avatar username={comment.user.username || undefined} imageUrl={comment.user.avatarUrl ?? undefined} size={24} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {comment.user.username || 'Unknown User'}
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {comment.content}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatTimeAgo(comment.createdAt)}
                </p>
              </div>
            </div>
          ))}

          {hasMoreComments && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-gray-500 dark:text-gray-400 mb-2"
            >
              View all {totalComments} comments
            </button>
          )}

          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-sm text-gray-500 dark:text-gray-400 mb-2"
            >
              Show less
            </button>
          )}
        </>
      )}

      {/* Comment Input */}
      <div className="flex gap-2 items-center mt-2">
        <Avatar username={currentUser?.username || undefined} imageUrl={currentUser?.avatarUrl ?? undefined} size={24} />
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          className="flex-1 text-sm bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          onClick={handleSubmit}
          disabled={!commentText.trim()}
          className="text-sm font-semibold text-blue-500 dark:text-blue-400 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
