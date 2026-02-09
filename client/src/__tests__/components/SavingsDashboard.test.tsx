import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SavingsDashboard from '@/components/SavingsDashboard';

jest.mock('lucide-react', () => ({
  DollarSign: (props: any) => <span data-testid="dollar-icon" {...props} />,
  ChefHat: (props: any) => <span data-testid="chef-icon" {...props} />,
  TrendingUp: (props: any) => <span data-testid="trending-icon" {...props} />,
}));

const mockGet = jest.fn();
jest.mock('@/lib/api', () => ({
  get: (...args: any[]) => mockGet(...args),
}));

describe('SavingsDashboard', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  test('renders savings data when meals have been cooked', async () => {
    mockGet.mockResolvedValue({ weekly: 15, monthly: 35, total: 80, mealsCooked: 12 });
    render(<SavingsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('80')).toBeInTheDocument();
    });
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('This week')).toBeInTheDocument();
    expect(screen.getByText('This month')).toBeInTheDocument();
    expect(screen.getByText('Total saved')).toBeInTheDocument();
    expect(screen.getByText('Meals cooked')).toBeInTheDocument();
  });

  test('renders empty state when no meals cooked', async () => {
    mockGet.mockResolvedValue({ weekly: 0, monthly: 0, total: 0, mealsCooked: 0 });
    render(<SavingsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Cook your first meal to start tracking savings!')).toBeInTheDocument();
    });
  });

  test('renders empty state on API error', async () => {
    mockGet.mockRejectedValue(new Error('fail'));
    render(<SavingsDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Total saved')).not.toBeInTheDocument();
    });
  });

  test('calls /cooking/savings API', async () => {
    mockGet.mockResolvedValue({ weekly: 0, monthly: 0, total: 0, mealsCooked: 0 });
    render(<SavingsDashboard />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/cooking/savings');
    });
  });
});
