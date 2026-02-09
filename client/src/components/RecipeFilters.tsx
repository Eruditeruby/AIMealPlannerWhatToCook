'use client';

interface RecipeFiltersProps {
  filters: { mealType: string; maxTime: string; cuisine: string };
  onChange: (filters: RecipeFiltersProps['filters']) => void;
}

const MEAL_TYPES = ['', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
const MAX_TIMES = ['', '15', '30', '60'];
const CUISINES = ['', 'italian', 'mexican', 'asian', 'american', 'mediterranean', 'indian'];

export default function RecipeFilters({ filters, onChange }: RecipeFiltersProps) {
  const handleChange = (key: string, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-[var(--text-secondary)]">Meal:</span>
        <select
          value={filters.mealType}
          onChange={(e) => handleChange('mealType', e.target.value)}
          className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2 py-1 text-sm text-[var(--text)]"
        >
          <option value="">Any</option>
          {MEAL_TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <span className="text-[var(--text-secondary)]">Time:</span>
        <select
          value={filters.maxTime}
          onChange={(e) => handleChange('maxTime', e.target.value)}
          className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2 py-1 text-sm text-[var(--text)]"
        >
          <option value="">Any</option>
          {MAX_TIMES.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t} min</option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <span className="text-[var(--text-secondary)]">Cuisine:</span>
        <select
          value={filters.cuisine}
          onChange={(e) => handleChange('cuisine', e.target.value)}
          className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2 py-1 text-sm text-[var(--text)]"
        >
          <option value="">Any</option>
          {CUISINES.filter(Boolean).map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </label>

      {(filters.mealType || filters.maxTime || filters.cuisine) && (
        <button
          onClick={() => onChange({ mealType: '', maxTime: '', cuisine: '' })}
          className="text-xs text-[var(--accent)] hover:underline self-center"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
