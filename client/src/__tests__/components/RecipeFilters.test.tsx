import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RecipeFilters from '@/components/RecipeFilters';

describe('RecipeFilters', () => {
  const defaultFilters = { mealType: '', maxTime: '', cuisine: '' };

  it('renders 3 dropdown selects', () => {
    render(<RecipeFilters filters={defaultFilters} onChange={jest.fn()} />);

    expect(screen.getByText('Meal:')).toBeInTheDocument();
    expect(screen.getByText('Time:')).toBeInTheDocument();
    expect(screen.getByText('Cuisine:')).toBeInTheDocument();

    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(3);
  });

  it('defaults to "Any" for all filters', () => {
    render(<RecipeFilters filters={defaultFilters} onChange={jest.fn()} />);

    const selects = screen.getAllByRole('combobox');
    selects.forEach((select) => {
      expect((select as HTMLSelectElement).value).toBe('');
    });
  });

  it('calls onChange with mealType when meal dropdown changes', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(<RecipeFilters filters={defaultFilters} onChange={onChange} />);

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'dinner');

    expect(onChange).toHaveBeenCalledWith({ mealType: 'dinner', maxTime: '', cuisine: '' });
  });

  it('calls onChange with maxTime when time dropdown changes', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(<RecipeFilters filters={defaultFilters} onChange={onChange} />);

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[1], '30');

    expect(onChange).toHaveBeenCalledWith({ mealType: '', maxTime: '30', cuisine: '' });
  });

  it('calls onChange with cuisine when cuisine dropdown changes', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(<RecipeFilters filters={defaultFilters} onChange={onChange} />);

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[2], 'italian');

    expect(onChange).toHaveBeenCalledWith({ mealType: '', maxTime: '', cuisine: 'italian' });
  });

  it('shows clear filters button when any filter is set', () => {
    render(
      <RecipeFilters
        filters={{ mealType: 'dinner', maxTime: '', cuisine: '' }}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('does not show clear button when no filters set', () => {
    render(<RecipeFilters filters={defaultFilters} onChange={jest.fn()} />);

    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('clears all filters when clear button clicked', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(
      <RecipeFilters
        filters={{ mealType: 'dinner', maxTime: '30', cuisine: 'italian' }}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText('Clear filters'));

    expect(onChange).toHaveBeenCalledWith({ mealType: '', maxTime: '', cuisine: '' });
  });
});
