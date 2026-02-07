import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Input from '@/components/ui/Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('handles onChange', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('shows error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('error message has red text', () => {
    render(<Input error="Error message" />);
    const errorElement = screen.getByText('Error message');
    expect(errorElement.className).toContain('text-red-500');
  });

  it('supports placeholder', () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('accepts value prop', () => {
    render(<Input value="test value" readOnly />);
    expect(screen.getByRole('textbox')).toHaveValue('test value');
  });

  it('accepts type prop', () => {
    const { container } = render(<Input type="password" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('accepts className prop', () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('custom-input');
  });

  it('associates label with input', () => {
    render(<Input label="Email" />);
    const label = screen.getByText('Email');
    const input = screen.getByRole('textbox');
    expect(label.tagName).toBe('LABEL');
    expect(input).toBeInTheDocument();
  });

  it('applies focus styles', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('focus:outline-none');
    expect(input.className).toContain('focus:ring-2');
  });
});
