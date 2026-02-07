'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import api from '@/lib/api';
import RecipeCard from '@/components/RecipeCard';
import { motion } from 'framer-motion';

function RecipesContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ingredients = searchParams.get('ingredients') || '';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && ingredients) {
      fetchRecipes();
    }
  }, [isAuthenticated, ingredients]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[Recipes] Fetching recipes for ingredients:', ingredients);
      const data = await api.get(`/recipes/suggest?ingredients=${ingredients}`);
      console.log('[Recipes] Response:', JSON.stringify(data).slice(0, 500));
      console.log('[Recipes] Recipe count:', data.recipes?.length ?? 'no recipes key');
      setRecipes(data.recipes || []);
    } catch (err: any) {
      console.error('[Recipes] Fetch error:', err.message, err);
      setError(err.message || 'Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (recipe: any) => {
    try {
      await api.post('/recipes/saved', {
        title: recipe.title,
        image: recipe.image,
        source: recipe.source || 'spoonacular',
        sourceId: recipe.id?.toString() || recipe.sourceId,
        instructions: recipe.instructions || '',
        ingredients: recipe.ingredients || recipe.usedIngredients || [],
        cookTime: recipe.cookTime || null,
        servings: recipe.servings || null,
        tags: recipe.tags || [],
        nutrition: recipe.nutrition || {},
      });
    } catch {
      // ignore
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-16 text-[var(--text-secondary)]">Finding recipes...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold mb-2">Recipe Suggestions</h1>
      <p className="text-[var(--text-secondary)] mb-6">
        Based on: {ingredients.split(',').join(', ')}
      </p>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {recipes.length === 0 && !error ? (
        <p className="text-center py-16 text-[var(--text-secondary)]">
          No recipes found. Try adding more ingredients to your pantry.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe, i) => (
            <motion.div
              key={recipe.id || recipe.title + i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <RecipeCard recipe={recipe} onSave={handleSave} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={<div className="text-center py-16">Loading...</div>}>
      <RecipesContent />
    </Suspense>
  );
}
