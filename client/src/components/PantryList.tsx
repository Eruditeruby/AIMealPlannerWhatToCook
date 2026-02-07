'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface PantryListProps {
  items: string[];
  onRemove: (item: string) => void;
}

export default function PantryList({ items, onRemove }: PantryListProps) {
  if (items.length === 0) {
    return (
      <p className="text-[var(--text-secondary)] text-center py-8">
        Your pantry is empty. Add some ingredients to get started!
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence>
        {items.map((item) => (
          <motion.span
            key={item}
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-full text-sm"
          >
            {item}
            <button
              onClick={() => onRemove(item)}
              aria-label={`Remove ${item}`}
              className="ml-1 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
