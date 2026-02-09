'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { HOUSEHOLD_OPTIONS, BUDGET_OPTIONS, DIETARY_OPTIONS } from '@/data/preferenceOptions';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [householdType, setHouseholdType] = useState('family-small');
  const [budgetGoal, setBudgetGoal] = useState('medium');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user?.preferences) {
      setHouseholdType(user.preferences.householdType || 'family-small');
      setBudgetGoal(user.preferences.budgetGoal || 'medium');
      setDietaryRestrictions(user.preferences.dietaryRestrictions || []);
    }
  }, [user]);

  const toggleDietary = (value: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await api.put('/auth/preferences', {
        householdType,
        budgetGoal,
        dietaryRestrictions,
      });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return <div className="text-center py-16 text-[var(--text-secondary)]">Loading...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-[var(--accent)]" />
        <h1 className="text-2xl font-bold">My Preferences</h1>
      </div>

      {/* Household Type */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Household Type</h2>
        <div className="grid grid-cols-2 gap-3">
          {HOUSEHOLD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setHouseholdType(opt.value)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                householdType === opt.value
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--border)] hover:border-[var(--accent)]/50'
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="text-sm font-medium text-[var(--text)]">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Goal */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Grocery Budget</h2>
        <div className="grid grid-cols-3 gap-3">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBudgetGoal(opt.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                budgetGoal === opt.value
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--border)] hover:border-[var(--accent)]/50'
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="text-xs font-medium text-[var(--text)]">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dietary Needs */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Dietary Needs</h2>
        <div className="grid grid-cols-2 gap-3">
          {DIETARY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleDietary(opt.value)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                dietaryRestrictions.includes(opt.value)
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--border)] hover:border-[var(--accent)]/50'
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="text-sm font-medium text-[var(--text)]">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} isLoading={saving} className="w-full">
        Save Changes
      </Button>

      {success && (
        <p className="text-green-500 text-center mt-4 text-sm">Saved successfully</p>
      )}
    </motion.div>
  );
}
