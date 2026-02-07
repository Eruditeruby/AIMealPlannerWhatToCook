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
});
