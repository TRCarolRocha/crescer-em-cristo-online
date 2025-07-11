
import React from 'react';

interface TagBadgeProps {
  tagName: string;
  color?: string;
  size?: 'sm' | 'md';
}

const TagBadge: React.FC<TagBadgeProps> = ({ tagName, color, size = 'sm' }) => {
  const badgeColor = color || '#6B7280';
  
  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-white font-semibold mr-1 mb-1 ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}
      style={{ backgroundColor: badgeColor }}
    >
      {tagName}
    </span>
  );
};

export default TagBadge;
