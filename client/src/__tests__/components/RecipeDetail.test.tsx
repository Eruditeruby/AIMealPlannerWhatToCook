import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RecipeDetail from '@/components/RecipeDetail';

// Mock dependencies
jest.mock('lucide-react', () => ({
  Clock: (props: any) => <span data-testid="clock-icon" {...props} />,
  Users: (props: any) => <span data-testid="users-icon" {...props} />,
  Heart: ({ fill, ...props }: any) => <span data-testid="heart-icon" data-fill={fill} {...props} />,
}));
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));
jest.mock('@/components/ui/Button', () => {
  return function MockButton({ children, onClick, variant }: any) {
    return (
      <button onClick={onClick} data-variant={variant}>
        {children}
      </button>
    );
  };
});

const mockRecipe = {
  title: 'Spaghetti Carbonara',
  image: 'https://example.com/carbonara.jpg',
  instructions: '<ol><li>Boil pasta</li><li>Cook bacon</li><li>Mix everything</li></ol>',
  ingredients: ['500g spaghetti', '200g bacon', '4 eggs', 'Parmesan cheese'],
  cookTime: 25,
  servings: 4,
  tags: ['Italian', 'Pasta', 'Quick'],
  nutrition: {
    calories: 650,
    protein: 28,
    carbs: 75,
    fat: 24,
  },
};

describe('RecipeDetail', () => {
  it('renders title', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
  });

  it('renders image when provided', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    const image = screen.getByAltText('Spaghetti Carbonara') as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toBe('https://example.com/carbonara.jpg');
  });

  it('does not render image when not provided', () => {
    const recipeNoImage = { ...mockRecipe, image: null };
    render(<RecipeDetail recipe={recipeNoImage} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders ingredients list', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    expect(screen.getByText('Ingredients')).toBeInTheDocument();
    expect(screen.getByText('500g spaghetti')).toBeInTheDocument();
    expect(screen.getByText('200g bacon')).toBeInTheDocument();
    expect(screen.getByText('4 eggs')).toBeInTheDocument();
    expect(screen.getByText('Parmesan cheese')).toBeInTheDocument();
  });

  it('renders instructions', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    expect(screen.getByText('Instructions')).toBeInTheDocument();
    expect(screen.getByText(/Boil pasta/)).toBeInTheDocument();
  });

  it('renders cook time', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    expect(screen.getByText('25 min')).toBeInTheDocument();
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
  });

  it('renders servings', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    expect(screen.getByText('4 servings')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
  });

  it('renders nutrition info', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    expect(screen.getByText('650')).toBeInTheDocument(); // Calories
    expect(screen.getByText('28g')).toBeInTheDocument(); // Protein
    expect(screen.getByText('75g')).toBeInTheDocument(); // Carbs
    expect(screen.getByText('24g')).toBeInTheDocument(); // Fat
    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByText('Protein')).toBeInTheDocument();
    expect(screen.getByText('Carbs')).toBeInTheDocument();
    expect(screen.getByText('Fat')).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    expect(screen.getByText('Italian')).toBeInTheDocument();
    expect(screen.getByText('Pasta')).toBeInTheDocument();
    expect(screen.getByText('Quick')).toBeInTheDocument();
  });

  it('does not render tags section when no tags', () => {
    const recipeNoTags = { ...mockRecipe, tags: [] };
    render(<RecipeDetail recipe={recipeNoTags} />);
    expect(screen.queryByText('Italian')).not.toBeInTheDocument();
  });

  it('does not render cook time when not provided', () => {
    const recipeNoTime = { ...mockRecipe, cookTime: null };
    render(<RecipeDetail recipe={recipeNoTime} />);
    expect(screen.queryByTestId('clock-icon')).not.toBeInTheDocument();
  });

  it('does not render servings when not provided', () => {
    const recipeNoServings = { ...mockRecipe, servings: null };
    render(<RecipeDetail recipe={recipeNoServings} />);
    expect(screen.queryByTestId('users-icon')).not.toBeInTheDocument();
  });

  it('renders save button when onSave provided', () => {
    const onSave = jest.fn();
    render(<RecipeDetail recipe={mockRecipe} onSave={onSave} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('does not render save button when onSave not provided', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onSave when save button clicked', async () => {
    const onSave = jest.fn();
    const user = userEvent.setup();
    render(<RecipeDetail recipe={mockRecipe} onSave={onSave} />);

    const saveButton = screen.getByRole('button');
    await user.click(saveButton);

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows filled heart when isSaved', () => {
    const onSave = jest.fn();
    render(<RecipeDetail recipe={mockRecipe} onSave={onSave} isSaved />);

    const heartIcon = screen.getByTestId('heart-icon');
    expect(heartIcon).toHaveAttribute('data-fill', 'currentColor');
  });

  it('shows unfilled heart when not saved', () => {
    const onSave = jest.fn();
    render(<RecipeDetail recipe={mockRecipe} onSave={onSave} isSaved={false} />);

    const heartIcon = screen.getByTestId('heart-icon');
    expect(heartIcon).toHaveAttribute('data-fill', 'none');
  });

  it('shows dash for missing nutrition values', () => {
    const recipePartialNutrition = {
      ...mockRecipe,
      nutrition: {
        calories: null,
        protein: 28,
        carbs: null,
        fat: 24,
      },
    };
    render(<RecipeDetail recipe={recipePartialNutrition} />);
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
  });
});
