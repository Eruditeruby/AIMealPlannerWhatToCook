import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import IngredientInput from '@/components/IngredientInput';

// Mock dependencies
jest.mock('lucide-react', () => ({
  Plus: (props: any) => <span data-testid="plus-icon" {...props} />,
}));
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));
jest.mock('@/data/ingredients', () => ({
  INGREDIENTS: ['tomato', 'tofu', 'tortilla', 'onion', 'olive oil', 'oregano', 'orange', 'carrot'],
}));

describe('IngredientInput', () => {
  it('renders input with "Add ingredient..." placeholder', () => {
    const onAdd = jest.fn();
    render(<IngredientInput onAdd={onAdd} />);
    expect(screen.getByPlaceholderText('Add ingredient...')).toBeInTheDocument();
  });

  it('calls onAdd on Enter', async () => {
    const onAdd = jest.fn();
    const user = userEvent.setup();
    render(<IngredientInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add ingredient...');
    await user.type(input, 'tomato{Enter}');

    expect(onAdd).toHaveBeenCalledWith('tomato');
  });

  it('calls onAdd on button click', async () => {
    const onAdd = jest.fn();
    const user = userEvent.setup();
    render(<IngredientInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add ingredient...');
    await user.type(input, 'onion');

    const button = screen.getByRole('button', { name: 'Add ingredient' });
    await user.click(button);

    expect(onAdd).toHaveBeenCalledWith('onion');
  });

  it('clears input after adding', async () => {
    const onAdd = jest.fn();
    const user = userEvent.setup();
    render(<IngredientInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add ingredient...') as HTMLInputElement;
    await user.type(input, 'carrot{Enter}');

    expect(input.value).toBe('');
  });

  it('does not add empty strings', async () => {
    const onAdd = jest.fn();
    const user = userEvent.setup();
    render(<IngredientInput onAdd={onAdd} />);

    const button = screen.getByRole('button', { name: 'Add ingredient' });
    await user.click(button);

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not add whitespace-only strings', async () => {
    const onAdd = jest.fn();
    const user = userEvent.setup();
    render(<IngredientInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add ingredient...');
    await user.type(input, '   {Enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('trims input before adding', async () => {
    const onAdd = jest.fn();
    const user = userEvent.setup();
    render(<IngredientInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add ingredient...');
    await user.type(input, '  potato  {Enter}');

    expect(onAdd).toHaveBeenCalledWith('potato');
  });

  it('renders Plus icon button', () => {
    const onAdd = jest.fn();
    render(<IngredientInput onAdd={onAdd} />);
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });

  it('prevents default form submission on Enter', async () => {
    const onAdd = jest.fn();
    const user = userEvent.setup();
    const handleSubmit = jest.fn((e) => e.preventDefault());

    render(
      <form onSubmit={handleSubmit}>
        <IngredientInput onAdd={onAdd} />
      </form>
    );

    const input = screen.getByPlaceholderText('Add ingredient...');
    await user.type(input, 'garlic{Enter}');

    expect(onAdd).toHaveBeenCalledWith('garlic');
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  // Autocomplete tests
  describe('autocomplete suggestions', () => {
    it('shows suggestions when typing a matching substring', async () => {
      const user = userEvent.setup();
      render(<IngredientInput onAdd={jest.fn()} />);

      const input = screen.getByPlaceholderText('Add ingredient...');
      await user.type(input, 'to');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('tomato')).toBeInTheDocument();
      expect(screen.getByText('tofu')).toBeInTheDocument();
      expect(screen.getByText('tortilla')).toBeInTheDocument();
    });

    it('clicking a suggestion adds it and clears input', async () => {
      const onAdd = jest.fn();
      const user = userEvent.setup();
      render(<IngredientInput onAdd={onAdd} />);

      const input = screen.getByPlaceholderText('Add ingredient...') as HTMLInputElement;
      await user.type(input, 'to');

      const suggestion = screen.getByText('tofu');
      await user.click(suggestion);

      expect(onAdd).toHaveBeenCalledWith('tofu');
      expect(input.value).toBe('');
    });

    it('excludes existing items from suggestions', async () => {
      const user = userEvent.setup();
      render(<IngredientInput onAdd={jest.fn()} existingItems={['tomato']} />);

      const input = screen.getByPlaceholderText('Add ingredient...');
      await user.type(input, 'to');

      expect(screen.queryByText('tomato')).not.toBeInTheDocument();
      expect(screen.getByText('tofu')).toBeInTheDocument();
    });

    it('navigates suggestions with ArrowDown/ArrowUp and selects with Enter', async () => {
      const onAdd = jest.fn();
      const user = userEvent.setup();
      render(<IngredientInput onAdd={onAdd} />);

      const input = screen.getByPlaceholderText('Add ingredient...');
      await user.type(input, 'to');

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      // First item in filtered list (mock order: tomato, tofu, tortilla)
      expect(onAdd).toHaveBeenCalledWith('tomato');
    });

    it('dismisses suggestions on Escape', async () => {
      const user = userEvent.setup();
      render(<IngredientInput onAdd={jest.fn()} />);

      const input = screen.getByPlaceholderText('Add ingredient...');
      await user.type(input, 'to');

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('does not show suggestions when input is empty', () => {
      render(<IngredientInput onAdd={jest.fn()} />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('does not show suggestions when no ingredients match', async () => {
      const user = userEvent.setup();
      render(<IngredientInput onAdd={jest.fn()} />);

      const input = screen.getByPlaceholderText('Add ingredient...');
      await user.type(input, 'zzzzz');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});
