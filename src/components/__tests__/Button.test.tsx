import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies btn-primary class by default', () => {
    render(<Button>Test</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('btn-primary');
  });

  it('appends custom className', () => {
    render(<Button className="extra">Test</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('extra');
    expect(btn.className).toContain('btn-primary');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button onClick={() => { clicked = true; }}>Press</Button>);
    await user.click(screen.getByRole('button'));
    expect(clicked).toBe(true);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button disabled onClick={() => { clicked = true; }}>Press</Button>);
    await user.click(screen.getByRole('button'));
    expect(clicked).toBe(false);
  });

  it('sets type attribute', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('sets aria-label when provided', () => {
    render(<Button ariaLabel="Save changes">Save</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Save changes');
  });
});
