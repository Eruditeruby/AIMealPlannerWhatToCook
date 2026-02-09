'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBasket, Clock, AlertTriangle } from 'lucide-react';

export interface PantryItem {
  name: string;
  addedAt: string;
  category: string;
  perishable: boolean;
}

interface PantryListProps {
  items: string[];
  pantryItems?: PantryItem[];
  onRemove: (item: string) => void;
}

const tagColors = [
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'bg-sky-500/15 text-sky-400 border-sky-500/20',
  'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'bg-violet-500/15 text-violet-400 border-violet-500/20',
  'bg-rose-500/15 text-rose-400 border-rose-500/20',
  'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20',
];

function getTagColor(item: string) {
  let hash = 0;
  for (let i = 0; i < item.length; i++) {
    hash = item.charCodeAt(i) + ((hash << 5) - hash);
  }
  return tagColors[Math.abs(hash) % tagColors.length];
}

function getUrgency(pantryItem: PantryItem): 'urgent' | 'soon' | null {
  if (!pantryItem.perishable) return null;
  const daysOld = (Date.now() - new Date(pantryItem.addedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld >= 4) return 'urgent';
  if (daysOld >= 2) return 'soon';
  return null;
}

function sortByUrgency(items: string[], pantryItems?: PantryItem[]): string[] {
  if (!pantryItems || pantryItems.length === 0) return items;

  const metaMap = new Map<string, PantryItem>();
  for (const pi of pantryItems) {
    metaMap.set(pi.name, pi);
  }

  return [...items].sort((a, b) => {
    const metaA = metaMap.get(a);
    const metaB = metaMap.get(b);
    const urgA = metaA ? getUrgency(metaA) : null;
    const urgB = metaB ? getUrgency(metaB) : null;

    const urgencyOrder = { urgent: 0, soon: 1 };
    const scoreA = urgA ? urgencyOrder[urgA] : 2;
    const scoreB = urgB ? urgencyOrder[urgB] : 2;

    if (scoreA !== scoreB) return scoreA - scoreB;

    // Within same urgency, perishable first
    const pA = metaA?.perishable ? 0 : 1;
    const pB = metaB?.perishable ? 0 : 1;
    return pA - pB;
  });
}

export default function PantryList({ items, pantryItems, onRemove }: PantryListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-[var(--text-secondary)]">
        <ShoppingBasket size={36} className="opacity-30" />
        <p className="text-sm">Your pantry is empty. Add some ingredients to get started!</p>
      </div>
    );
  }

  const metaMap = new Map<string, PantryItem>();
  if (pantryItems) {
    for (const pi of pantryItems) {
      metaMap.set(pi.name, pi);
    }
  }

  const sortedItems = sortByUrgency(items, pantryItems);

  return (
    <div className="flex flex-wrap gap-2.5">
      <AnimatePresence>
        {sortedItems.map((item) => {
          const meta = metaMap.get(item);
          const urgency = meta ? getUrgency(meta) : null;

          return (
            <motion.span
              key={item}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 border rounded-full text-sm font-medium ${
                urgency === 'urgent'
                  ? 'bg-red-500/15 text-red-400 border-red-500/30'
                  : urgency === 'soon'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : getTagColor(item)
              }`}
            >
              {urgency === 'urgent' && (
                <AlertTriangle size={13} className="text-red-400" aria-label="Use today" />
              )}
              {urgency === 'soon' && (
                <Clock size={13} className="text-amber-400" aria-label="Use soon" />
              )}
              {item}
              {urgency && (
                <span className={`text-[10px] font-semibold ml-0.5 ${
                  urgency === 'urgent' ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {urgency === 'urgent' ? 'Use today!' : 'Use soon'}
                </span>
              )}
              <button
                onClick={() => onRemove(item)}
                aria-label={`Remove ${item}`}
                className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
