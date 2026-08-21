import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroCharacter } from '../HeroCharacter';

describe('HeroCharacter Component', () => {
  it('renders Archimedes the Sage Owl companion by default or when avatar is owl', () => {
    render(<HeroCharacter avatar="owl" />);
    expect(screen.getByRole('img', { name: /Archimedes the Sage Owl/i })).toBeInTheDocument();
  });

  it('renders Nexus the Chrono-Bot companion when avatar is bot', () => {
    render(<HeroCharacter avatar="bot" />);
    expect(screen.getByRole('img', { name: /Nexus the Chrono-Bot/i })).toBeInTheDocument();
  });

  it('renders Aura the Stellar Fox companion when avatar is fox', () => {
    render(<HeroCharacter avatar="fox" />);
    expect(screen.getByRole('img', { name: /Aura the Stellar Fox/i })).toBeInTheDocument();
  });

  it('mounts within hero-companion-slot container on scenic cliff ledge', () => {
    const { container } = render(<HeroCharacter avatar="owl" className="custom-hero" />);
    const slot = container.querySelector('.hero-companion-slot');
    expect(slot).toBeInTheDocument();
    expect(slot).toHaveClass('custom-hero');
  });

  it('triggers onTap callback when clicked or tapped', () => {
    const handleTap = vi.fn();
    render(<HeroCharacter avatar="owl" onTap={handleTap} />);

    const puppet = screen.getByRole('img', { name: /Archimedes/i });
    fireEvent.click(puppet);

    expect(handleTap).toHaveBeenCalled();
  });
});
