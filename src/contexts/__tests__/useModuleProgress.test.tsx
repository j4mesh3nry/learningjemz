import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { GameProvider, useModuleProgress } from '../GameContext';
import { LivesTracker, SpeedrunTimerDock, GameReviewDock } from '../../components/game';

// Mock Supabase
vi.mock('../../utils/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      upsert: () => Promise.resolve({ error: null }),
      insert: () => Promise.resolve({ error: null }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  },
}));

vi.mock('../AuthContext', () => ({
  useAuth: () => ({ user: null, logout: vi.fn() }),
}));

function TestModuleConsumer({ moduleId = 'testModule' }: { moduleId?: string }) {
  const { xp, level, streak, moduleStats, recordProgress } = useModuleProgress(moduleId);

  return (
    <div>
      <div data-testid="xp-value">{xp}</div>
      <div data-testid="level-value">{level}</div>
      <div data-testid="streak-value">{streak}</div>
      <div data-testid="module-count">{moduleStats?.scoreCount || 0}</div>
      <button
        onClick={() =>
          recordProgress({
            xpGained: 25,
            statsUpdate: { scoreCount: (moduleStats?.scoreCount || 0) + 5 },
            streakEligible: true,
          })
        }
      >
        Complete Level
      </button>
    </div>
  );
}

describe('useModuleProgress Hook & Game Progression Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('updates XP, streak, and namespaced module stats upon recording progress', async () => {
    const user = userEvent.setup();

    render(
      <GameProvider>
        <TestModuleConsumer moduleId="testModule" />
      </GameProvider>
    );

    expect(screen.getByTestId('xp-value').textContent).toBe('0');
    expect(screen.getByTestId('module-count').textContent).toBe('0');

    await user.click(screen.getByRole('button', { name: /Complete Level/i }));

    expect(screen.getByTestId('xp-value').textContent).toBe('25');
    expect(screen.getByTestId('module-count').textContent).toBe('5');
    expect(screen.getByTestId('streak-value').textContent).toBe('1');
  });

  it('isolates state across different module IDs', async () => {
    function MultiModuleConsumer() {
      const moduleA = useModuleProgress('moduleA');
      const moduleB = useModuleProgress('moduleB');

      return (
        <div>
          <div data-testid="moduleA-score">{moduleA.moduleStats?.score || 0}</div>
          <div data-testid="moduleB-score">{moduleB.moduleStats?.score || 0}</div>
          <button
            onClick={() =>
              moduleA.recordProgress({
                xpGained: 10,
                statsUpdate: { score: 100 },
              })
            }
          >
            Update Module A
          </button>
          <button
            onClick={() =>
              moduleB.recordProgress({
                xpGained: 15,
                statsUpdate: { score: 200 },
              })
            }
          >
            Update Module B
          </button>
        </div>
      );
    }

    const user = userEvent.setup();

    render(
      <GameProvider>
        <MultiModuleConsumer />
      </GameProvider>
    );

    await user.click(screen.getByRole('button', { name: /Update Module A/i }));
    expect(screen.getByTestId('moduleA-score').textContent).toBe('100');
    expect(screen.getByTestId('moduleB-score').textContent).toBe('0');

    await user.click(screen.getByRole('button', { name: /Update Module B/i }));
    expect(screen.getByTestId('moduleA-score').textContent).toBe('100');
    expect(screen.getByTestId('moduleB-score').textContent).toBe('200');
  });
});

describe('Reusable Game Templates', () => {
  it('renders LivesTracker with active and lost hearts correctly', () => {
    render(<LivesTracker lives={2} maxLives={3} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '2 of 3 lives remaining');
  });

  it('renders SpeedrunTimerDock with formatted time and penalty badge', () => {
    render(<SpeedrunTimerDock elapsedSeconds={65.4} penaltySeconds={3} isRunning={false} />);
    expect(screen.getByRole('timer')).toBeInTheDocument();
    expect(screen.getByText('01:05.4')).toBeInTheDocument();
    expect(screen.getByText('+3s')).toBeInTheDocument();
  });

  it('renders GameReviewDock with metrics and triggers exit callback', async () => {
    const handleExit = vi.fn();
    const handlePlayAgain = vi.fn();
    const user = userEvent.setup();

    render(
      <GameReviewDock
        title="Stage Cleared!"
        scoreText="10/10"
        xpEarned={30}
        streak={5}
        isNewHighScore={true}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
      />
    );

    expect(screen.getByText('Stage Cleared!')).toBeInTheDocument();
    expect(screen.getByText('NEW RECORD!')).toBeInTheDocument();
    expect(screen.getByText('10/10')).toBeInTheDocument();
    expect(screen.getByText('+30')).toBeInTheDocument();
    expect(screen.getByText('5d')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Play Again/i }));
    expect(handlePlayAgain).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /Back to Hub/i }));
    expect(handleExit).toHaveBeenCalledTimes(1);
  });
});
