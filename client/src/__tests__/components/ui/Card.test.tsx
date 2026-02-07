import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Card from '@/components/ui/Card';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('accepts className prop', () => {
    render(
      <Card className="custom-class">
        <p>Content</p>
      </Card>
    );
    const card = screen.getByText('Content').parentElement;
    expect(card?.className).toContain('custom-class');
  });

  it('has cursor-pointer when onClick provided', () => {
    const handleClick = jest.fn();
    render(
      <Card onClick={handleClick}>
        <p>Clickable</p>
      </Card>
    );
    const card = screen.getByText('Clickable').parentElement;
    expect(card?.className).toContain('cursor-pointer');
  });

  it('does not have cursor-pointer when onClick not provided', () => {
    render(
      <Card>
        <p>Not clickable</p>
      </Card>
    );
    const card = screen.getByText('Not clickable').parentElement;
    expect(card?.className).not.toContain('cursor-pointer');
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(
      <Card onClick={handleClick}>
        <p>Click me</p>
      </Card>
    );

    const card = screen.getByText('Click me').parentElement;
    await user.click(card!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies default styles', () => {
    render(
      <Card>
        <p>Styled card</p>
      </Card>
    );
    const card = screen.getByText('Styled card').parentElement;
    expect(card?.className).toContain('bg-[var(--surface)]');
    expect(card?.className).toContain('rounded-xl');
    expect(card?.className).toContain('border');
  });
});
