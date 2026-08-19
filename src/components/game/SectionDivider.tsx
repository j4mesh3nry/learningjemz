import React from 'react';
import { Sprout } from 'lucide-react';

interface SectionDividerProps {
  title?: string;
  highlightWord?: string;
  diamonds?: number;
  showLeaves?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Reusable Two-Tone Section Divider with Sprout leaves and diamond accents.
 * Example:
 * <SectionDivider title="Continue your" highlightWord="journey" showLeaves />
 * <SectionDivider title="Your progress" diamonds={2} />
 */
export function SectionDivider({
  title,
  highlightWord,
  diamonds = 1,
  showLeaves = true,
  className = '',
  children,
}: SectionDividerProps) {
  return (
    <div className={`home-section-divider ${className}`.trim()} role="separator">
      {showLeaves && <Sprout size={16} className="home-divider-icon" />}
      
      <span className="home-divider-label">
        {children ? (
          children
        ) : (
          <>
            {title && <span>{title} </span>}
            {highlightWord && <span className="text-emerald">{highlightWord}</span>}
          </>
        )}
      </span>

      {showLeaves && <Sprout size={16} className="home-divider-icon flip-h" />}

      {Array.from({ length: diamonds }).map((_, idx) => (
        <React.Fragment key={idx}>
          <div className="home-section-divider-line" />
          <span className="home-divider-diamond">◆</span>
        </React.Fragment>
      ))}
      <div className="home-section-divider-line" />
    </div>
  );
}

export default SectionDivider;
