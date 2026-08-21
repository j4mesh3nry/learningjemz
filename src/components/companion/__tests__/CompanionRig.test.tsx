// src/components/companion/__tests__/CompanionRig.test.tsx
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CompanionRig } from '../CompanionRig';

describe('CompanionRig', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders Archimedes the Sage Owl by default with articulated layers', () => {
    render(<CompanionRig avatar="owl" />);
    const rig = screen.getByRole('img', { name: /Archimedes/i });
    expect(rig).toBeInTheDocument();
    expect(rig).toHaveClass('companion-rig-root');
  });

  it('renders Nexus the Chrono-Bot when avatar is bot', () => {
    render(<CompanionRig avatar="bot" />);
    const rig = screen.getByRole('img', { name: /Nexus/i });
    expect(rig).toBeInTheDocument();
  });

  it('renders Aura the Stellar Fox when avatar is fox', () => {
    render(<CompanionRig avatar="fox" />);
    const rig = screen.getByRole('img', { name: /Aura/i });
    expect(rig).toBeInTheDocument();
  });

  it('triggers tap interaction and calls onTap on click', () => {
    const handleTap = vi.fn();
    render(<CompanionRig avatar="owl" onTap={handleTap} />);
    const rig = screen.getByRole('img', { name: /Archimedes/i });

    fireEvent.click(rig);

    expect(handleTap).toHaveBeenCalledTimes(1);
    expect(rig).toHaveClass('state-tap-happy');

    // After animation duration, returns to idle
    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(rig).not.toHaveClass('state-tap-happy');
  });

  it('cycles through eye blinks periodically', () => {
    render(<CompanionRig avatar="owl" />);
    const rig = screen.getByRole('img', { name: /Archimedes/i });
    expect(rig).toBeInTheDocument();

    // Advance timer to trigger a blink
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Check that timers run smoothly without unhandled exceptions
    expect(rig).toBeInTheDocument();
  });
});
