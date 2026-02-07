'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import RecipeDetail from '@/components/RecipeDetail';
import { motion } from 'framer-motion';

export default function RecipeDetailPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchRecipe();
    }
  }, [isAuthenticated, params.id]);

  const fetchRecipe = async () => {
    try {
      const data = await api.get(`/recipes/${params.id}`);
      setRecipe(data);
    } catch {
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!recipe) return;
    try {
      await api.post('/recipes/saved', {
        title: recipe.title,
        image: recipe.image,
        source: 'spoonacular',
        sourceId: params.id?.toString(),
        instructions: recipe.instructions,
        ingredients: recipe.ingredients,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        nutrition: recipe.nutrition,
      });
    } catch {
      // ignore
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-16 text-[var(--text-secondary)]">Loading recipe...</div>;
  }

  if (!recipe) {
    return <div className="text-center py-16 text-[var(--text-secondary)]">Recipe not found.</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <RecipeDetail recipe={recipe} onSave={handleSave} />
    </motion.div>
  );
}
