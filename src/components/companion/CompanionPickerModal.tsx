// src/components/companion/CompanionPickerModal.tsx
import React, { useState, useEffect } from 'react';
import { COMPANION_LIST, getCompanion, type CompanionConfig } from '../../data/companions';
import { LivingPuppet } from './LivingPuppet';
import { AvatarIcon } from '../AvatarIcon';
import { Check, X, Sparkles } from 'lucide-react';
import './companion-picker.css';

export interface CompanionPickerModalProps {
  currentAvatar: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function CompanionPickerModal({
  currentAvatar,
  onSelect,
  onClose,
}: CompanionPickerModalProps) {
  const initialCompanion = getCompanion(currentAvatar);
  const [selectedId, setSelectedId] = useState<string>(initialCompanion.id);

  const selectedCompanion: CompanionConfig = getCompanion(selectedId);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleConfirm = () => {
    onSelect(selectedId);
    onClose();
  };

  return (
    <div
      className="companion-picker-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="companion-picker-title"
    >
      <div
        className="companion-picker-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          '--stage-ambient': selectedCompanion.ambientColor,
        } as React.CSSProperties}
      >
        {/* ── Modal Header ── */}
        <div className="companion-picker-header">
          <button
            className="companion-picker-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} strokeWidth={2.4} />
          </button>

          <div className="companion-picker-brand-tag">
            <Sparkles size={14} strokeWidth={2.5} /> Living Companions
          </div>
          <h2 id="companion-picker-title" className="companion-picker-title">
            Choose Your Companion
          </h2>
          <p className="companion-picker-subtitle">
            Your companion breathes, blinks, and journeys beside you on your quest.
          </p>
        </div>

        {/* ── Live Preview Stage ── */}
        <div className="companion-picker-stage-box">
          <div className="companion-picker-stage-info">
            <h3 className="companion-picker-stage-name">{selectedCompanion.name}</h3>
            <p className="companion-picker-stage-species">{selectedCompanion.species}</p>
          </div>

          <div className="companion-picker-stage-living">
            <LivingPuppet avatar={selectedId} scale={0.92} />
          </div>
        </div>

        {/* ── Companion Cards Grid ── */}
        <div className="companion-picker-grid">
          {COMPANION_LIST.map((comp) => {
            const isSelected = selectedId === comp.id;
            return (
              <div
                key={comp.id}
                className={`companion-card ${isSelected ? 'is-selected' : ''}`}
                style={{
                  '--card-ambient': comp.ambientColor,
                  '--card-ambient-glow': `${comp.ambientColor}44`,
                } as React.CSSProperties}
                onClick={() => setSelectedId(comp.id)}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`Select ${comp.name} the ${comp.species}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedId(comp.id);
                  }
                }}
              >
                <div className="companion-card-scene-thumb">
                  <AvatarIcon avatar={comp.id} size={54} bordered />
                  {isSelected && (
                    <div className="companion-card-check-badge">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <h4 className="companion-card-name">{comp.name}</h4>
                <p className="companion-card-species">{comp.species}</p>

                <div className="companion-card-traits-pills">
                  {comp.traits.map((trait, idx) => (
                    <span key={idx} className="companion-trait-pill">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Action Dock ── */}
        <div className="companion-picker-footer">
          <button
            type="button"
            className="companion-picker-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="companion-picker-confirm-btn"
            onClick={handleConfirm}
          >
            <Check size={18} strokeWidth={2.6} /> Set Active Companion
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompanionPickerModal;
