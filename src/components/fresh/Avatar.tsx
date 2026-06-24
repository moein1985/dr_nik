import React from 'react';

interface AvatarProps {
  username?: string;
  imageUrl?: string;
  size?: number;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ username, imageUrl, size = 40, className = '' }) => {
  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size * 0.4}px`,
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={username || 'User'}
        className={`rounded-full object-cover ${className}`}
        style={avatarStyle}
      />
    );
  }

  // Generate consistent color based on username
  const getAvatarColor = (name?: string): string => {
    if (!name) return '#6b7280';
    const colors: readonly string[] = [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
      '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
      '#ec4899', '#f43f5e'
    ] as const;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index] ?? '#6b7280';
  };

  const initial = username ? username.charAt(0).toUpperCase() : '?';
  const backgroundColor = getAvatarColor(username) || '#6b7280';

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-semibold ${className}`}
      style={{
        ...avatarStyle,
        backgroundColor,
      }}
    >
      {initial}
    </div>
  );
};

export default Avatar;
