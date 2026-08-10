import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SizeGuide from '../space/SizeGuide';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SizeGuide', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and navigation tabs', () => {
    render(
      <MemoryRouter>
        <SizeGuide />
      </MemoryRouter>
    );

    expect(screen.getByText('Objects by Size Guide')).toBeInTheDocument();
    expect(screen.getByText('Study List')).toBeInTheDocument();
    expect(screen.getByText('Mnemonic')).toBeInTheDocument();
    expect(screen.getByText('Flashcards')).toBeInTheDocument();
    expect(screen.getByText('Practice')).toBeInTheDocument();
  });

  it('navigates back to space on back button click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SizeGuide />
      </MemoryRouter>
    );

    const backBtn = screen.getByRole('button', { name: /back to space/i });
    await user.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/space');
  });

  it('filters objects list when searching', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SizeGuide />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search by name/i);
    await user.type(searchInput, 'Jupiter');

    expect(screen.getByText('Jupiter')).toBeInTheDocument();
    expect(screen.queryByText('Saturn')).not.toBeInTheDocument();
  });

  it('switches to Mnemonic tab and displays mnemonic explanation', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SizeGuide />
      </MemoryRouter>
    );

    const mnemonicTab = screen.getByRole('button', { name: /mnemonic/i });
    await user.click(mnemonicTab);

    expect(screen.getByText('How the Mnemonic Works')).toBeInTheDocument();
    expect(screen.getByText('Full Mnemonic Sentence:')).toBeInTheDocument();
  });

  it('switches to Flashcards tab and cycles through cards', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SizeGuide />
      </MemoryRouter>
    );

    const flashcardsTab = screen.getByRole('button', { name: /flashcards/i });
    await user.click(flashcardsTab);

    expect(screen.getByText(/card 1 of 35/i)).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /next →/i });
    await user.click(nextBtn);

    expect(screen.getByText(/card 2 of 35/i)).toBeInTheDocument();
  });

  it('switches to Practice tab and loads interactive quiz', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SizeGuide />
      </MemoryRouter>
    );

    const practiceTab = screen.getByRole('button', { name: /practice/i });
    await user.click(practiceTab);

    expect(screen.getByText(/question 1 of 5/i)).toBeInTheDocument();
  });
});
