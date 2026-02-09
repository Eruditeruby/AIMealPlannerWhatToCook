'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import { ChefHat, Refrigerator, TrendingDown, Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Refrigerator, title: 'Your Kitchen, Tracked', desc: 'Know exactly what you have and what needs using soon' },
  { icon: Clock, title: 'Dinner in 10 Seconds', desc: 'AI finds the best meals from your ingredients' },
  { icon: DollarSign, title: 'Never Waste Again', desc: 'Track savings and build your family recipe book' },
];

export default function Home() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/pantry');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className="flex flex-col items-center text-center mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ChefHat size={64} className="text-[var(--accent)] mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-3">What To Cook?</h1>
        <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-md">
          Stop wasting groceries. Tell us what you have &mdash; we&apos;ll tell you what to cook.
        </p>
        <Button onClick={login} className="text-lg px-8 py-3">
          Get Started with Google
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-3xl"
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
          >
            <f.icon size={32} className="text-[var(--accent)] mx-auto mb-3" />
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-20 w-full max-w-2xl text-center"
      >
        <div className="p-8 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <TrendingDown size={28} className="text-[var(--accent)] mx-auto mb-3" />
          <p className="text-2xl font-bold mb-2">The average family wastes $2,000/year in food</p>
          <p className="text-[var(--text-secondary)]">
            What To Cook helps you use what you already have, so less food ends up in the trash
            and more money stays in your wallet.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
