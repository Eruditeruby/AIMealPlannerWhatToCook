'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import api from '@/lib/api';

interface CookingEntry {
  _id: string;
  recipeTitle: string;
  estimatedSavings: number;
  cookedAt: string;
}

function groupByDate(entries: CookingEntry[]) {
  const groups: Record<string, CookingEntry[]> = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const entry of entries) {
    const dateStr = new Date(entry.cookedAt).toDateString();
    let label = dateStr;
    if (dateStr === today) label = 'Today';
    else if (dateStr === yesterday) label = 'Yesterday';

    if (!groups[label]) groups[label] = [];
    groups[label].push(entry);
  }
  return groups;
}

export default function HistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<CookingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    try {
      const data = await api.get('/cooking/history');
      setHistory(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-16 text-[var(--text-secondary)]">Loading...</div>;
  }

  const groups = groupByDate(history);
  const groupKeys = Object.keys(groups);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="w-8 h-8 text-[var(--accent)]" />
        <h1 className="text-2xl font-bold">Cooking History</h1>
      </div>

      {groupKeys.length === 0 ? (
        <p className="text-center py-16 text-[var(--text-secondary)]">
          No cooking history yet. Cook a recipe to start tracking!
        </p>
      ) : (
        groupKeys.map((dateLabel) => (
          <div key={dateLabel} className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">{dateLabel}</h2>
            <div className="space-y-2">
              {groups[dateLabel].map((entry) => (
                <div
                  key={entry._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                >
                  <span className="font-medium text-[var(--text)]">{entry.recipeTitle}</span>
                  <span className="text-sm text-green-500">${entry.estimatedSavings} saved</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </motion.div>
  );
}
