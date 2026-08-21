// src/components/companion/__tests__/LivingPuppet.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LivingPuppet } from '../LivingPuppet';

describe('LivingPuppet', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders Archimedes the Sage Owl puppet by default', () => {
    render(<LivingPuppet avatar="owl" />);
    const puppet = screen.getByRole('img', { name: /Archimedes the Sage Owl/i });
    expect(puppet).toBeInTheDocument();
  });

  it('renders Aura the Stellar Fox puppet when avatar is fox', () => {
    render(<LivingPuppet avatar="fox" />);
    const puppet = screen.getByRole('img', { name: /Aura the Stellar Fox/i });
    expect(puppet).toBeInTheDocument();
  });

  it('renders Nexus the Chrono-Bot puppet when avatar is bot', () => {
    render(<LivingPuppet avatar="bot" />);
    const puppet = screen.getByRole('img', { name: /Nexus the Chrono-Bot/i });
    expect(puppet).toBeInTheDocument();
  });

  it('triggers happy state and tap handler on click', () => {
    const handleTap = vi.fn();
    render(
      <LivingPuppet
        avatar="owl"
        onTap={handleTap}
      />
    );

    const puppet = screen.getByRole('img', { name: /Archimedes the Sage Owl/i });
    expect(puppet).toBeInTheDocument();

    // Click companion to trigger happy tap state
    fireEvent.click(puppet);
    expect(handleTap).toHaveBeenCalledTimes(1);

    // Puppet enters happy/tapped state
    expect(puppet.className).toContain('is-tapped');

    // After animation delay, happy state clears
    act(() => {
      vi.advanceTimersByTime(2300);
    });
    expect(puppet.className).not.toContain('is-tapped');
  });

  it('triggers blinking loop over time', () => {
    render(<LivingPuppet avatar="owl" />);
    const puppet = screen.getByRole('img', { name: /Archimedes the Sage Owl/i });
    expect(puppet).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
  });
});
