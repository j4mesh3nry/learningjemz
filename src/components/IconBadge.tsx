import React from 'react';

type IconBadgeProps = {
  icon: React.ReactNode;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
};

export const IconBadge: React.FC<IconBadgeProps> = ({ icon, label, className = '', style }) => {
  const classes = `icon-badge ${className}`.trim();
  return (
    <div className={classes} style={style} aria-label={label}>
      {icon}
    </div>
  );
};
