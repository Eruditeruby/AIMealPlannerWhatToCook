'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBasket } from 'lucide-react';

interface PantryListProps {
  items: string[];
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

export default function PantryList({ items, onRemove }: PantryListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-[var(--text-secondary)]">
        <ShoppingBasket size={36} className="opacity-30" />
        <p className="text-sm">Your pantry is empty. Add some ingredients to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      <AnimatePresence>
        {items.map((item) => (
          <motion.span
            key={item}
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 border rounded-full text-sm font-medium ${getTagColor(item)}`}
          >
            {item}
            <button
              onClick={() => onRemove(item)}
              aria-label={`Remove ${item}`}
              className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
