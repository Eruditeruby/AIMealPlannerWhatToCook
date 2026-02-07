'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import { Plus } from 'lucide-react';
import { INGREDIENTS } from '@/data/ingredients';

interface IngredientInputProps {
  onAdd: (ingredient: string) => void;
  existingItems?: string[];
}

export default function IngredientInput({ onAdd, existingItems = [] }: IngredientInputProps) {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = value.trim().length > 0
    ? INGREDIENTS.filter(
        (ing) =>
          ing.toLowerCase().includes(value.trim().toLowerCase()) &&
          !existingItems.map((i) => i.toLowerCase()).includes(ing.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && value.trim().length > 0);
    setSelectedIndex(-1);
  }, [value]);

  const handleAdd = (ingredient?: string) => {
    const trimmed = (ingredient ?? value).trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedIndex(-1);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleAdd(suggestions[selectedIndex]);
        } else {
          handleAdd();
        }
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion to register
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex gap-2">
        <Input
          placeholder="Add ingredient..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          className="flex-1"
          autoComplete="off"
        />
        <Button onClick={() => handleAdd()} aria-label="Add ingredient">
          <Plus size={18} />
        </Button>
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-10 w-full mt-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((s, i) => (
            <li
              key={s}
              role="option"
              aria-selected={i === selectedIndex}
              className={`px-3 py-2 cursor-pointer text-sm ${
                i === selectedIndex
                  ? 'bg-[var(--accent)] text-white'
                  : 'hover:bg-[var(--bg-secondary)]'
              }`}
              onMouseDown={() => handleAdd(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
