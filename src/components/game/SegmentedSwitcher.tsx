import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedSwitcherProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * Reusable Segmented Tab Switcher (Play / Learn, XP / Streak).
 * Renders a dark pill toggle with a glowing active pill indicator.
 */
export function SegmentedSwitcher({
  tabs,
  activeTab,
  onChange,
  ariaLabel = 'Navigation tabs',
  className = '',
}: SegmentedSwitcherProps) {
  return (
    <div
      className={`game-segmented-switcher ${className}`.trim()}
      role="tablist"
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#05130e',
        border: '1.5px solid #102d1f',
        borderRadius: '9999px',
        padding: '4px',
        margin: '16px 0',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '9999px',
              border: isActive ? '1.5px solid #1c5236' : '1.5px solid transparent',
              background: isActive ? '#0b2518' : 'transparent',
              color: isActive ? '#34d399' : '#6b8f7b',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: isActive ? '0 0 14px rgba(52, 211, 153, 0.22)' : 'none',
              transition: 'all 0.18s ease',
              outline: 'none',
            }}
          >
            {tab.icon && (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedSwitcher;
