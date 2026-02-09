'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import IngredientInput from '@/components/IngredientInput';
import PantryList from '@/components/PantryList';
import OnboardingWizard from '@/components/OnboardingWizard';
import SavingsDashboard from '@/components/SavingsDashboard';
import Button from '@/components/ui/Button';
import { ChefHat, Refrigerator, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PantryPage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<string[]>([]);
  const [pantryItems, setPantryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && !user.preferences?.onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [user]);

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
      setPantryItems(data.pantryItems || []);
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
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <span className="text-[var(--text-secondary)]">Loading your pantry...</span>
      </div>
    );
  }

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    await refreshUser();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      {showOnboarding && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-[var(--accent)]/10 rounded-xl">
          <Refrigerator size={28} className="text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">My Pantry</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {items.length === 0
              ? 'Add ingredients you have at home'
              : `${items.length} ingredient${items.length !== 1 ? 's' : ''} in your pantry`}
          </p>
        </div>
      </div>

      {/* Add Ingredient Section */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 mb-6">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
          Add ingredients
        </label>
        <IngredientInput onAdd={handleAdd} existingItems={items} />
      </div>

      {/* Pantry Items Section */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 mb-6 min-h-[120px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-[var(--text-secondary)]">Your ingredients</h2>
          {items.length > 0 && (
            <span className="text-xs text-[var(--text-secondary)] bg-[var(--background)] px-2.5 py-1 rounded-full">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <PantryList items={items} pantryItems={pantryItems} onRemove={handleRemove} />
      </div>

      {/* Savings Dashboard */}
      <SavingsDashboard />

      {/* Cook Button */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={handleCook}
            className="w-full py-4 rounded-2xl font-semibold text-lg text-white bg-gradient-to-r from-[var(--accent)] to-emerald-500 hover:from-[var(--accent-hover)] hover:to-emerald-600 transition-all shadow-lg shadow-[var(--accent)]/20 hover:shadow-xl hover:shadow-[var(--accent)]/30 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Sparkles size={22} />
            What Can I Cook?
            <ChefHat size={22} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
