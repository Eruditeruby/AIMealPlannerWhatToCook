'use client';

import { Clock, Users, Heart } from 'lucide-react';
import Button from './ui/Button';

interface RecipeDetailProps {
  recipe: {
    title: string;
    image?: string | null;
    instructions: string;
    ingredients: string[];
    cookTime?: number | null;
    servings?: number | null;
    tags?: string[];
    nutrition?: {
      calories?: number | null;
      protein?: number | null;
      carbs?: number | null;
      fat?: number | null;
    };
  };
  onSave?: () => void;
  isSaved?: boolean;
}

export default function RecipeDetail({ recipe, onSave, isSaved }: RecipeDetailProps) {
  return (
    <div className="max-w-3xl mx-auto">
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-64 object-cover rounded-xl mb-6"
        />
      )}

      <div className="flex items-start justify-between mb-4">
        <h1 className="text-2xl font-bold text-[var(--text)]">{recipe.title}</h1>
        {onSave && (
          <Button variant="ghost" onClick={onSave}>
            <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mb-6">
        {recipe.cookTime && (
          <span className="flex items-center gap-1"><Clock size={16} /> {recipe.cookTime} min</span>
        )}
        {recipe.servings && (
          <span className="flex items-center gap-1"><Users size={16} /> {recipe.servings} servings</span>
        )}
      </div>

      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 bg-[var(--border)] rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {recipe.nutrition && (
        <div className="grid grid-cols-4 gap-3 mb-6 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
          {[
            { label: 'Calories', value: recipe.nutrition.calories },
            { label: 'Protein', value: recipe.nutrition.protein, unit: 'g' },
            { label: 'Carbs', value: recipe.nutrition.carbs, unit: 'g' },
            { label: 'Fat', value: recipe.nutrition.fat, unit: 'g' },
          ].map((n) => (
            <div key={n.label} className="text-center">
              <div className="text-lg font-bold text-[var(--accent)]">
                {n.value ?? '-'}{n.unit || ''}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">{n.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Ingredients</h2>
        <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
          {recipe.ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Instructions</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
          {recipe.instructions.replace(/<[^>]*>/g, '')}
        </p>
      </div>
    </div>
  );
}
