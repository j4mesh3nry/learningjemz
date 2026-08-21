// src/components/companion/__tests__/CompanionPickerModal.test.tsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompanionPickerModal } from '../CompanionPickerModal';

describe('CompanionPickerModal', () => {
  it('renders all 3 companions with names and trait tags', () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <CompanionPickerModal
        currentAvatar="owl"
        onSelect={handleSelect}
        onClose={handleClose}
      />
    );

    expect(screen.getByText(/Choose Your Companion/i)).toBeInTheDocument();
    expect(screen.getAllByText('Archimedes').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Aura').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Nexus').length).toBeGreaterThanOrEqual(1);

    // Traits
    expect(screen.getByText('Wise')).toBeInTheDocument();
    expect(screen.getByText('Playful')).toBeInTheDocument();
    expect(screen.getByText('Techy')).toBeInTheDocument();
  });

  it('allows selecting a companion and confirming', () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <CompanionPickerModal
        currentAvatar="owl"
        onSelect={handleSelect}
        onClose={handleClose}
      />
    );

    // Select Fox card
    const foxCard = screen.getByRole('button', { name: /Select Aura the Stellar Fox/i });
    fireEvent.click(foxCard);

    // Confirm
    const confirmBtn = screen.getByRole('button', { name: /Set Active Companion/i });
    fireEvent.click(confirmBtn);

    expect(handleSelect).toHaveBeenCalledWith('fox');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the Cancel or close button', () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <CompanionPickerModal
        currentAvatar="owl"
        onSelect={handleSelect}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /Close modal/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
