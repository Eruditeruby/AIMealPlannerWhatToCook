import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SettingsPage from '@/app/settings/page';
import { AuthProvider } from '@/context/AuthContext';
import api from '@/lib/api';

jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));
jest.mock('lucide-react', () => ({
  Settings: () => <span data-testid="settings-icon" />,
}));
jest.mock('@/components/ui/Button', () => {
  return function MockButton({ children, onClick, isLoading }: any) {
    return <button onClick={onClick} disabled={isLoading}>{children}</button>;
  };
});

const mockPush = jest.fn();

const mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  preferences: {
    dietaryRestrictions: ['vegetarian'],
    familySize: null,
    budgetGoal: 'low',
    householdType: 'couple',
    onboardingComplete: true,
  },
};

describe('Settings page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false, media: query, onchange: null,
        addListener: jest.fn(), removeListener: jest.fn(),
        addEventListener: jest.fn(), removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('redirects if not authenticated', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <SettingsPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('renders page title', async () => {
    (api.get as jest.Mock).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <SettingsPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('My Preferences')).toBeInTheDocument();
    });
  });

  it('pre-fills user preferences', async () => {
    (api.get as jest.Mock).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <SettingsPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('My Preferences')).toBeInTheDocument();
    });

    // Check that sections render
    expect(screen.getByText('Household Type')).toBeInTheDocument();
    expect(screen.getByText('Grocery Budget')).toBeInTheDocument();
    expect(screen.getByText('Dietary Needs')).toBeInTheDocument();
  });

  it('submits preferences and shows success message', async () => {
    (api.get as jest.Mock).mockResolvedValue(mockUser);
    (api.put as jest.Mock).mockResolvedValue({});

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <SettingsPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/auth/preferences', expect.objectContaining({
        householdType: 'couple',
        budgetGoal: 'low',
        dietaryRestrictions: ['vegetarian'],
      }));
    });

    await waitFor(() => {
      expect(screen.getByText('Saved successfully')).toBeInTheDocument();
    });
  });

  it('renders all preference option sections', async () => {
    (api.get as jest.Mock).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <SettingsPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Just me')).toBeInTheDocument();
    });

    // Household options
    expect(screen.getByText('Two of us')).toBeInTheDocument();
    expect(screen.getByText('Family (3-4)')).toBeInTheDocument();
    expect(screen.getByText('Family (5+)')).toBeInTheDocument();

    // Budget options
    expect(screen.getByText('Budget-friendly')).toBeInTheDocument();
    expect(screen.getByText('Moderate')).toBeInTheDocument();
    expect(screen.getByText('No limit')).toBeInTheDocument();

    // Dietary options
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
    expect(screen.getByText('Vegan')).toBeInTheDocument();
    expect(screen.getByText('Gluten-free')).toBeInTheDocument();
    expect(screen.getByText('Dairy-free')).toBeInTheDocument();
    expect(screen.getByText('Nut-free')).toBeInTheDocument();
  });
});
