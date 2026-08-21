import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameModuleCard } from '../GameModuleCard';

describe('GameModuleCard Component', () => {
  it('renders card title, subtitle, and badge icon', () => {
    render(
      <GameModuleCard
        title="Chess Master Hub"
        subtitle="Learn and play chess"
        badgeIcon={<span data-testid="badge-icon">♔</span>}
        theme="chess"
      />
    );

    expect(screen.getByText('Chess Master Hub')).toBeInTheDocument();
    expect(screen.getByText('Learn and play chess')).toBeInTheDocument();
    expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
  });

  it('invokes onClick handler when clicked while unlocked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <GameModuleCard
        title="Space Explorer"
        subtitle="Explore the solar system"
        badgeIcon={<span>🚀</span>}
        onClick={handleClick}
        theme="space"
      />
    );

    const card = screen.getByRole('button', { name: /space explorer/i });
    await user.click(card);

    expect(handleClick).toHaveBeenCalled();
  });

  it('renders locked state with locked badge and prevents click actions', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <GameModuleCard
        title="Module 3"
        subtitle="Future learning realm"
        badgeIcon={<span>🔒</span>}
        locked={true}
        lockedBadgeText="Coming Soon"
        onClick={handleClick}
      />
    );

    expect(screen.getByText('Coming Soon')).toBeInTheDocument();

    const card = screen.getByRole('button', { name: /module 3/i });
    expect(card).toHaveAttribute('aria-disabled', 'true');

    await user.click(card);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
