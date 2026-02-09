import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PantryList from '@/components/PantryList';
import type { PantryItem } from '@/components/PantryList';

// Mock dependencies
jest.mock('lucide-react', () => ({
  X: (props: any) => <span data-testid="x-icon" {...props} />,
  ShoppingBasket: (props: any) => <span data-testid="basket-icon" {...props} />,
  Clock: (props: any) => <span data-testid="clock-icon" {...props} />,
  AlertTriangle: (props: any) => <span data-testid="alert-icon" {...props} />,
}));
jest.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const makePantryItem = (name: string, opts: Partial<PantryItem> = {}): PantryItem => ({
  name,
  addedAt: opts.addedAt || new Date().toISOString(),
  category: opts.category || 'other',
  perishable: opts.perishable ?? false,
});

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

  // Freshness badge tests
  describe('freshness badges', () => {
    it('shows "Use today!" badge for perishable items added 4+ days ago', () => {
      const items = ['spinach'];
      const pantryItems = [makePantryItem('spinach', { perishable: true, addedAt: daysAgo(5) })];
      render(<PantryList items={items} pantryItems={pantryItems} onRemove={jest.fn()} />);

      expect(screen.getByText('Use today!')).toBeInTheDocument();
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    });

    it('shows "Use soon" badge for perishable items added 2-3 days ago', () => {
      const items = ['milk'];
      const pantryItems = [makePantryItem('milk', { perishable: true, addedAt: daysAgo(3) })];
      render(<PantryList items={items} pantryItems={pantryItems} onRemove={jest.fn()} />);

      expect(screen.getByText('Use soon')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('shows no badge for perishable items added less than 2 days ago', () => {
      const items = ['chicken'];
      const pantryItems = [makePantryItem('chicken', { perishable: true, addedAt: daysAgo(1) })];
      render(<PantryList items={items} pantryItems={pantryItems} onRemove={jest.fn()} />);

      expect(screen.queryByText('Use today!')).not.toBeInTheDocument();
      expect(screen.queryByText('Use soon')).not.toBeInTheDocument();
    });

    it('shows no badge for non-perishable items regardless of age', () => {
      const items = ['rice'];
      const pantryItems = [makePantryItem('rice', { perishable: false, addedAt: daysAgo(30) })];
      render(<PantryList items={items} pantryItems={pantryItems} onRemove={jest.fn()} />);

      expect(screen.queryByText('Use today!')).not.toBeInTheDocument();
      expect(screen.queryByText('Use soon')).not.toBeInTheDocument();
    });

    it('sorts urgent items first, then soon, then others', () => {
      const items = ['rice', 'spinach', 'milk'];
      const pantryItems = [
        makePantryItem('rice', { perishable: false }),
        makePantryItem('spinach', { perishable: true, addedAt: daysAgo(5) }),
        makePantryItem('milk', { perishable: true, addedAt: daysAgo(3) }),
      ];
      const { container } = render(
        <PantryList items={items} pantryItems={pantryItems} onRemove={jest.fn()} />
      );

      // Get all remove buttons in order - their aria-labels contain item names
      const removeButtons = screen.getAllByRole('button');
      const orderedNames = removeButtons.map((btn) => {
        const label = btn.getAttribute('aria-label') || '';
        return label.replace('Remove ', '');
      });
      expect(orderedNames).toEqual(['spinach', 'milk', 'rice']);
    });

    it('works without pantryItems prop (backward compatible)', () => {
      const items = ['tomato', 'rice'];
      render(<PantryList items={items} onRemove={jest.fn()} />);

      expect(screen.getByText('tomato')).toBeInTheDocument();
      expect(screen.getByText('rice')).toBeInTheDocument();
      expect(screen.queryByText('Use today!')).not.toBeInTheDocument();
    });
  });
});
