'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import api from '@/lib/api';
import { debug, debugError } from '@/lib/debug';
import RecipeCard from '@/components/RecipeCard';
import { motion } from 'framer-motion';

function RecipesContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Map of recipe key -> saved document _id
  const [savedMap, setSavedMap] = useState<Record<string, string>>({});

  const ingredients = searchParams.get('ingredients') || '';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && ingredients) {
      fetchRecipes();
      fetchSaved();
    }
  }, [isAuthenticated, ingredients]);

  const getRecipeKey = (recipe: any) =>
    recipe.sourceId || recipe.id?.toString() || recipe.title;

  const fetchSaved = async () => {
    try {
      const data = await api.get('/recipes/saved');
      const map: Record<string, string> = {};
      for (const r of data) {
        const key = r.sourceId || r.title;
        map[key] = r._id;
      }
      setSavedMap(map);
    } catch {
      // ignore
    }
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError('');
      debug('[Recipes] Fetching recipes for ingredients:', ingredients);
      const data = await api.get(`/recipes/suggest?ingredients=${ingredients}`);
      debug('[Recipes] Response:', JSON.stringify(data).slice(0, 500));
      debug('[Recipes] Recipe count:', data.recipes?.length ?? 'no recipes key');
      setRecipes(data.recipes || []);
    } catch (err: any) {
      debugError('[Recipes] Fetch error:', err.message, err);
      setError(err.message || 'Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleCooked = async (recipe: any) => {
    try {
      await api.post('/cooking/log', {
        recipeTitle: recipe.title,
        ingredientsUsed: recipe.ingredients || recipe.usedIngredients || [],
      });
    } catch {
      // ignore
    }
  };

  const handleToggleSave = async (recipe: any) => {
    const key = getRecipeKey(recipe);
    const existingId = savedMap[key];

    if (existingId) {
      // Unsave
      debug('[Save] Unsaving recipe:', recipe.title, existingId);
      try {
        await api.delete(`/recipes/saved/${existingId}`);
        setSavedMap((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      } catch (err: any) {
        debugError('[Save] Unsave error:', err.message, err);
      }
    } else {
      // Save
      const payload = {
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
      };
      debug('[Save] Saving recipe:', recipe.title);
      try {
        const result = await api.post('/recipes/saved', payload);
        setSavedMap((prev) => ({ ...prev, [key]: result._id }));
        debug('[Save] Success:', result._id);
      } catch (err: any) {
        debugError('[Save] Error:', err.message, err);
      }
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
              <RecipeCard
                recipe={recipe}
                onSave={handleToggleSave}
                onCooked={handleCooked}
                isSaved={!!savedMap[getRecipeKey(recipe)]}
              />
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
