'use client';

import { useState, KeyboardEvent } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import { Plus } from 'lucide-react';

interface IngredientInputProps {
  onAdd: (ingredient: string) => void;
}

export default function IngredientInput({ onAdd }: IngredientInputProps) {
  const [value, setValue] = useState('');

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Add ingredient..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1"
      />
      <Button onClick={handleAdd} aria-label="Add ingredient">
        <Plus size={18} />
      </Button>
    </div>
  );
}
