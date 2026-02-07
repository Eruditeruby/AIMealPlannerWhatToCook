'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import IngredientInput from '@/components/IngredientInput';
import PantryList from '@/components/PantryList';
import Button from '@/components/ui/Button';
import { ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PantryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPantry();
    }
  }, [isAuthenticated]);

  const fetchPantry = async () => {
    try {
      const data = await api.get('/pantry');
      setItems(data.items || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const updatePantry = async (newItems: string[]) => {
    setItems(newItems);
    try {
      await api.put('/pantry', { items: newItems });
    } catch {
      fetchPantry(); // revert on error
    }
  };

  const handleAdd = (ingredient: string) => {
    const lower = ingredient.toLowerCase();
    if (items.includes(lower)) return;
    updatePantry([...items, lower]);
  };

  const handleRemove = (item: string) => {
    updatePantry(items.filter((i) => i !== item));
  };

  const handleCook = () => {
    router.push(`/recipes?ingredients=${items.join(',')}`);
  };

  if (authLoading || loading) {
    return <div className="text-center py-16 text-[var(--text-secondary)]">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      <h1 className="text-2xl font-bold mb-6">My Pantry</h1>

      <IngredientInput onAdd={handleAdd} existingItems={items} />

      <div className="mt-6">
        <PantryList items={items} onRemove={handleRemove} />
      </div>

      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <Button onClick={handleCook} className="text-lg px-8 py-3">
            <ChefHat size={20} className="inline mr-2" />
            What Can I Cook?
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
