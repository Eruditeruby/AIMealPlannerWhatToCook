'use client';

import { useRouter } from 'next/navigation';
import Card from './ui/Card';
import { Clock, Users, Heart, ChefHat } from 'lucide-react';

interface Recipe {
  id?: number;
  title: string;
  image?: string | null;
  source?: string;
  sourceId?: string | null;
  cookTime?: number | null;
  servings?: number | null;
}

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: (recipe: Recipe) => void;
  onCooked?: (recipe: Recipe) => void;
  isSaved?: boolean;
}

export default function RecipeCard({ recipe, onSave, onCooked, isSaved }: RecipeCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (recipe.source === 'spoonacular' && recipe.id) {
      router.push(`/recipes/${recipe.id}`);
    }
  };

  return (
    <Card onClick={handleClick} className="relative overflow-hidden">
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-40 object-cover rounded-lg mb-3"
        />
      )}
      {!recipe.image && (
        <div className="w-full h-40 bg-[var(--border)] rounded-lg mb-3 flex items-center justify-center text-[var(--text-secondary)]">
          No image
        </div>
      )}

      <h3 className="font-semibold text-[var(--text)] mb-2 line-clamp-2">{recipe.title}</h3>

      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
        {recipe.cookTime && (
          <span className="flex items-center gap-1">
            <Clock size={14} /> {recipe.cookTime}m
          </span>
        )}
        {recipe.servings && (
          <span className="flex items-center gap-1">
            <Users size={14} /> {recipe.servings}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          recipe.source === 'ai'
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
        }`}>
          {recipe.source === 'ai' ? 'AI' : 'Spoonacular'}
        </span>

        <div className="flex items-center gap-2">
          {onCooked && (
            <button
              onClick={(e) => { e.stopPropagation(); onCooked(recipe); }}
              aria-label="I cooked this"
              className="text-xs px-2 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors flex items-center gap-1"
            >
              <ChefHat size={14} /> Cooked!
            </button>
          )}
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(recipe); }}
              aria-label={isSaved ? 'Unsave recipe' : 'Save recipe'}
              className={`transition-colors ${isSaved ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-red-500'}`}
            >
              <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
