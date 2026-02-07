'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import RecipeCard from '@/components/RecipeCard';
import { motion } from 'framer-motion';

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      const data = await api.get('/recipes/saved');
      setRecipes(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (recipe: any) => {
    try {
      await api.delete(`/recipes/saved/${recipe._id}`);
      setRecipes((prev) => prev.filter((r) => r._id !== recipe._id));
    } catch {
      // ignore
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-16 text-[var(--text-secondary)]">Loading...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold mb-6">My Favorites</h1>

      {recipes.length === 0 ? (
        <p className="text-center py-16 text-[var(--text-secondary)]">
          No saved recipes yet. Find some recipes and save your favorites!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe, i) => (
            <motion.div
              key={recipe._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <RecipeCard recipe={recipe} onSave={handleUnsave} isSaved />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
