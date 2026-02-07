import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RecipeCard from '@/components/RecipeCard';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('lucide-react', () => ({
  Clock: (props: any) => <span data-testid="clock-icon" {...props} />,
  Users: (props: any) => <span data-testid="users-icon" {...props} />,
  Heart: ({ fill, ...props }: any) => <span data-testid="heart-icon" data-fill={fill} {...props} />,
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));
jest.mock('@/components/ui/Card', () => {
  return function MockCard({ children, onClick }: any) {
    return <div onClick={onClick}>{children}</div>;
  };
});

const mockRecipe = {
  id: 123,
  title: 'Tomato Pasta',
  image: 'https://example.com/pasta.jpg',
  source: 'spoonacular',
  cookTime: 30,
  servings: 4,
};

describe('RecipeCard', () => {
  it('renders recipe title', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('Tomato Pasta')).toBeInTheDocument();
  });

  it('shows image when provided', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    const image = screen.getByAltText('Tomato Pasta') as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toBe('https://example.com/pasta.jpg');
  });

  it('shows fallback when no image', () => {
    const recipeNoImage = { ...mockRecipe, image: null };
    render(<RecipeCard recipe={recipeNoImage} />);
    expect(screen.getByText('No image')).toBeInTheDocument();
  });

  it('shows cook time and servings', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('30m')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
  });

  it('shows source badge - Spoonacular', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('Spoonacular')).toBeInTheDocument();
  });

  it('shows source badge - AI', () => {
    const aiRecipe = { ...mockRecipe, source: 'ai' };
    render(<RecipeCard recipe={aiRecipe} />);
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('shows save button when onSave provided', () => {
    const onSave = jest.fn();
    render(<RecipeCard recipe={mockRecipe} onSave={onSave} />);
    expect(screen.getByRole('button', { name: 'Save recipe' })).toBeInTheDocument();
  });

  it('does not show save button when onSave not provided', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onSave on heart click', async () => {
    const onSave = jest.fn();
    const user = userEvent.setup();
    render(<RecipeCard recipe={mockRecipe} onSave={onSave} />);

    const saveButton = screen.getByRole('button', { name: 'Save recipe' });
    await user.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(mockRecipe);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows filled heart when isSaved is true', () => {
    const onSave = jest.fn();
    render(<RecipeCard recipe={mockRecipe} onSave={onSave} isSaved />);

    const heartIcon = screen.getByTestId('heart-icon');
    expect(heartIcon).toHaveAttribute('data-fill', 'currentColor');
  });

  it('shows unfilled heart when isSaved is false', () => {
    const onSave = jest.fn();
    render(<RecipeCard recipe={mockRecipe} onSave={onSave} isSaved={false} />);

    const heartIcon = screen.getByTestId('heart-icon');
    expect(heartIcon).toHaveAttribute('data-fill', 'none');
  });

  it('updates aria-label when saved', () => {
    const onSave = jest.fn();
    render(<RecipeCard recipe={mockRecipe} onSave={onSave} isSaved />);

    const button = screen.getByRole('button', { name: 'Unsave recipe' });
    expect(button).toBeInTheDocument();
  });

  it('does not show cook time if not provided', () => {
    const recipeNoTime = { ...mockRecipe, cookTime: null };
    render(<RecipeCard recipe={recipeNoTime} />);
    expect(screen.queryByTestId('clock-icon')).not.toBeInTheDocument();
  });

  it('does not show servings if not provided', () => {
    const recipeNoServings = { ...mockRecipe, servings: null };
    render(<RecipeCard recipe={recipeNoServings} />);
    expect(screen.queryByTestId('users-icon')).not.toBeInTheDocument();
  });

  it('has red text class on save button when isSaved', () => {
    const onSave = jest.fn();
    render(<RecipeCard recipe={mockRecipe} onSave={onSave} isSaved />);
    const button = screen.getByRole('button', { name: 'Unsave recipe' });
    expect(button.className).toContain('text-red-500');
  });

  it('does not have red text class on save button when not saved', () => {
    const onSave = jest.fn();
    render(<RecipeCard recipe={mockRecipe} onSave={onSave} isSaved={false} />);
    const button = screen.getByRole('button', { name: 'Save recipe' });
    // The class list includes 'hover:text-red-500' but should NOT have standalone 'text-red-500'
    const classes = button.className.split(/\s+/);
    expect(classes).not.toContain('text-red-500');
    expect(button.className).toContain('text-[var(--text-secondary)]');
  });
});
