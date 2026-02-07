import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PantryList from '@/components/PantryList';

// Mock dependencies
jest.mock('lucide-react', () => ({
  X: (props: any) => <span data-testid="x-icon" {...props} />,
}));
jest.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('PantryList', () => {
  it('renders list of items', () => {
    const items = ['tomato', 'onion', 'garlic'];
    const onRemove = jest.fn();
    render(<PantryList items={items} onRemove={onRemove} />);

    expect(screen.getByText('tomato')).toBeInTheDocument();
    expect(screen.getByText('onion')).toBeInTheDocument();
    expect(screen.getByText('garlic')).toBeInTheDocument();
  });

  it('each item has remove button', () => {
    const items = ['tomato', 'onion'];
    const onRemove = jest.fn();
    render(<PantryList items={items} onRemove={onRemove} />);

    const removeButtons = screen.getAllByRole('button');
    expect(removeButtons).toHaveLength(2);
  });

  it('calls onRemove when clicked', async () => {
    const items = ['tomato', 'onion'];
    const onRemove = jest.fn();
    const user = userEvent.setup();
    render(<PantryList items={items} onRemove={onRemove} />);

    const removeButton = screen.getByRole('button', { name: 'Remove tomato' });
    await user.click(removeButton);

    expect(onRemove).toHaveBeenCalledWith('tomato');
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('shows empty state message', () => {
    const onRemove = jest.fn();
    render(<PantryList items={[]} onRemove={onRemove} />);

    expect(screen.getByText('Your pantry is empty. Add some ingredients to get started!')).toBeInTheDocument();
  });

  it('does not show items when empty', () => {
    const onRemove = jest.fn();
    render(<PantryList items={[]} onRemove={onRemove} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders X icon for each item', () => {
    const items = ['tomato', 'onion'];
    const onRemove = jest.fn();
    render(<PantryList items={items} onRemove={onRemove} />);

    const xIcons = screen.getAllByTestId('x-icon');
    expect(xIcons).toHaveLength(2);
  });

  it('has accessible aria-label for remove buttons', () => {
    const items = ['potato'];
    const onRemove = jest.fn();
    render(<PantryList items={items} onRemove={onRemove} />);

    const removeButton = screen.getByRole('button', { name: 'Remove potato' });
    expect(removeButton).toHaveAttribute('aria-label', 'Remove potato');
  });

  it('renders multiple items correctly', () => {
    const items = ['carrot', 'celery', 'bell pepper', 'mushroom'];
    const onRemove = jest.fn();
    render(<PantryList items={items} onRemove={onRemove} />);

    items.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });
});
