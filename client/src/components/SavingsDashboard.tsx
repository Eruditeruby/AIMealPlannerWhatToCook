'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DollarSign, ChefHat, TrendingUp } from 'lucide-react';

interface SavingsData {
  weekly: number;
  monthly: number;
  total: number;
  mealsCooked: number;
}

export default function SavingsDashboard() {
  const [data, setData] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavings();
  }, []);

  const fetchSavings = async () => {
    try {
      const result = await api.get('/cooking/savings');
      setData(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  if (!data || data.mealsCooked === 0) {
    return (
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={18} className="text-[var(--accent)]" />
          <h2 className="text-sm font-medium text-[var(--text-secondary)]">Your Savings</h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Cook your first meal to start tracking savings!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-[var(--accent)]" />
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">Your Savings</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
            <DollarSign size={16} />
            <span className="text-xl font-bold">{data.weekly}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">This week</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
            <DollarSign size={16} />
            <span className="text-xl font-bold">{data.monthly}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">This month</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
            <DollarSign size={16} />
            <span className="text-xl font-bold">{data.total}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Total saved</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[var(--accent)]">
            <ChefHat size={16} />
            <span className="text-xl font-bold">{data.mealsCooked}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Meals cooked</p>
        </div>
      </div>
    </div>
  );
}
