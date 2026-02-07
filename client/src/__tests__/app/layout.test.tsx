import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout from '@/app/layout';
import api from '@/lib/api';

// Mock dependencies
jest.mock('@/lib/api');
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-font-class',
  }),
}));
jest.mock('@/app/providers', () => ({
  Providers: ({ children }: any) => <div data-testid="providers">{children}</div>,
}));
jest.mock('@/components/Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar">Navbar</nav>;
  };
});

describe('Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));
  });

  it('wraps with providers', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('providers')).toBeInTheDocument();
  });

  it('renders Navbar', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('applies Inter font', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const body = container.querySelector('body');
    expect(body?.className).toContain('inter-font-class');
  });

  it('renders children inside main', () => {
    render(
      <RootLayout>
        <div>Page Content</div>
      </RootLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveTextContent('Page Content');
  });

  it('applies background color class', () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const body = container.querySelector('body');
    expect(body?.className).toContain('bg-[var(--background)]');
  });

  it('applies antialiased class', () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const body = container.querySelector('body');
    expect(body?.className).toContain('antialiased');
  });

  it('applies min-h-screen class', () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const body = container.querySelector('body');
    expect(body?.className).toContain('min-h-screen');
  });

  it('main has max-width container', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const main = screen.getByRole('main');
    expect(main.className).toContain('max-w-6xl');
    expect(main.className).toContain('mx-auto');
  });

  it('main has padding', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const main = screen.getByRole('main');
    expect(main.className).toContain('px-4');
    expect(main.className).toContain('py-8');
  });

  it('html has lang attribute', () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const html = container.querySelector('html');
    expect(html).toHaveAttribute('lang', 'en');
  });

  it('html element exists', () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const html = container.querySelector('html');
    expect(html).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <RootLayout>
        <div>First</div>
        <div>Second</div>
      </RootLayout>
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('maintains layout structure', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    // Check structure: html > body > Providers > (Navbar + main)
    const html = container.querySelector('html');
    const body = html?.querySelector('body');
    const providers = body?.querySelector('[data-testid="providers"]');
    const navbar = providers?.querySelector('[data-testid="navbar"]');
    const main = providers?.querySelector('main');

    expect(html).toBeInTheDocument();
    expect(body).toBeInTheDocument();
    expect(providers).toBeInTheDocument();
    expect(navbar).toBeInTheDocument();
    expect(main).toBeInTheDocument();
  });
});
