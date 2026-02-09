import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OnboardingWizard from '@/components/OnboardingWizard';
import api from '@/lib/api';

jest.mock('@/lib/api');
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));
jest.mock('lucide-react', () => ({
  Users: () => <span data-testid="users-icon" />,
  Wallet: () => <span data-testid="wallet-icon" />,
  Leaf: () => <span data-testid="leaf-icon" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
  ChevronLeft: () => <span data-testid="chevron-left" />,
  X: () => <span data-testid="x-icon" />,
}));
jest.mock('@/components/ui/Button', () => {
  return function MockButton({ children, onClick, isLoading, variant, ...props }: any) {
    return (
      <button onClick={onClick} disabled={isLoading} data-variant={variant} {...props}>
        {isLoading ? 'Loading...' : children}
      </button>
    );
  };
});

describe('OnboardingWizard', () => {
  const mockOnComplete = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (api.put as jest.Mock).mockResolvedValue({ preferences: {} });
  });

  const renderWizard = () =>
    render(<OnboardingWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);

  test('renders step 1: household type', () => {
    renderWizard();
    expect(screen.getByText('Who are you cooking for?')).toBeInTheDocument();
    expect(screen.getByText('Just me')).toBeInTheDocument();
    expect(screen.getByText('Two of us')).toBeInTheDocument();
    expect(screen.getByText('Family (3-4)')).toBeInTheDocument();
    expect(screen.getByText('Family (5+)')).toBeInTheDocument();
  });

  test('renders progress indicators', () => {
    const { container } = renderWizard();
    const progressDots = container.querySelectorAll('.h-1\\.5');
    expect(progressDots.length).toBe(3);
  });

  test('navigates to step 2 on Next click', () => {
    renderWizard();
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText("What's your grocery budget?")).toBeInTheDocument();
    expect(screen.getByText('Budget-friendly')).toBeInTheDocument();
    expect(screen.getByText('Moderate')).toBeInTheDocument();
    expect(screen.getByText('No limit')).toBeInTheDocument();
  });

  test('navigates to step 3 from step 2', () => {
    renderWizard();
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Any dietary needs?')).toBeInTheDocument();
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
    expect(screen.getByText('Vegan')).toBeInTheDocument();
  });

  test('Back button returns to previous step', () => {
    renderWizard();
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText("What's your grocery budget?")).toBeInTheDocument();

    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Who are you cooking for?')).toBeInTheDocument();
  });

  test('step 1 shows "Skip for now" instead of Back', () => {
    renderWizard();
    expect(screen.getByText('Skip for now')).toBeInTheDocument();
  });

  test('last step shows "Let\'s Cook!" button', () => {
    renderWizard();
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText("Let's Cook!")).toBeInTheDocument();
  });

  test('selecting an option highlights it', () => {
    renderWizard();
    const justMe = screen.getByText('Just me').closest('button');
    fireEvent.click(justMe!);
    expect(justMe).toHaveClass('border-[var(--accent)]');
  });

  test('submits preferences on final step', async () => {
    renderWizard();
    // Step 1: select household
    fireEvent.click(screen.getByText('Two of us'));
    fireEvent.click(screen.getByText('Next'));

    // Step 2: select budget
    fireEvent.click(screen.getByText('Budget-friendly'));
    fireEvent.click(screen.getByText('Next'));

    // Step 3: select dietary + submit
    fireEvent.click(screen.getByText('Vegetarian'));
    fireEvent.click(screen.getByText("Let's Cook!"));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/auth/preferences', {
        householdType: 'couple',
        budgetGoal: 'low',
        dietaryRestrictions: ['vegetarian'],
        onboardingComplete: true,
      });
    });

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  test('skip button calls onSkip and marks onboarding complete', async () => {
    renderWizard();
    fireEvent.click(screen.getByText('Skip for now'));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/auth/preferences', {
        onboardingComplete: true,
      });
    });

    await waitFor(() => {
      expect(mockOnSkip).toHaveBeenCalled();
    });
  });

  test('X button in header calls skip', async () => {
    renderWizard();
    fireEvent.click(screen.getByLabelText('Skip onboarding'));

    await waitFor(() => {
      expect(mockOnSkip).toHaveBeenCalled();
    });
  });

  test('multi-select allows toggling multiple dietary options', () => {
    renderWizard();
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));

    // Select two options
    fireEvent.click(screen.getByText('Vegetarian'));
    fireEvent.click(screen.getByText('Gluten-free'));

    const vegButton = screen.getByText('Vegetarian').closest('button');
    const gfButton = screen.getByText('Gluten-free').closest('button');
    expect(vegButton).toHaveClass('border-[var(--accent)]');
    expect(gfButton).toHaveClass('border-[var(--accent)]');

    // Deselect one
    fireEvent.click(screen.getByText('Vegetarian'));
    expect(vegButton).not.toHaveClass('border-[var(--accent)]');
    expect(gfButton).toHaveClass('border-[var(--accent)]');
  });

  test('completes even if API call fails', async () => {
    (api.put as jest.Mock).mockRejectedValue(new Error('Network error'));

    renderWizard();
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText("Let's Cook!"));

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });
});
