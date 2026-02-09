'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Wallet, Leaf, ChevronRight, ChevronLeft, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { HOUSEHOLD_OPTIONS, BUDGET_OPTIONS, DIETARY_OPTIONS } from '@/data/preferenceOptions';

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

const STEPS = [
  {
    key: 'householdType',
    title: 'Who are you cooking for?',
    subtitle: 'This helps us suggest the right portion sizes',
    icon: Users,
    options: HOUSEHOLD_OPTIONS,
  },
  {
    key: 'budgetGoal',
    title: "What's your grocery budget?",
    subtitle: "We'll prioritize recipes that match your budget",
    icon: Wallet,
    options: BUDGET_OPTIONS,
  },
  {
    key: 'dietaryRestrictions',
    title: 'Any dietary needs?',
    subtitle: 'Select all that apply (or skip)',
    icon: Leaf,
    options: DIETARY_OPTIONS,
    multiSelect: true,
  },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

export default function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string | string[]>>({
    householdType: 'family-small',
    budgetGoal: 'medium',
    dietaryRestrictions: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleSelect = (value: string) => {
    if ('multiSelect' in step && step.multiSelect) {
      const current = (selections[step.key] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setSelections({ ...selections, [step.key]: updated });
    } else {
      setSelections({ ...selections, [step.key]: value });
    }
  };

  const isSelected = (value: string) => {
    const sel = selections[step.key];
    if (Array.isArray(sel)) return sel.includes(value);
    return sel === value;
  };

  const handleNext = async () => {
    if (isLastStep) {
      await handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.put('/auth/preferences', {
        householdType: selections.householdType,
        budgetGoal: selections.budgetGoal,
        dietaryRestrictions: selections.dietaryRestrictions,
        onboardingComplete: true,
      });
      onComplete();
    } catch {
      // Allow completion even if save fails
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      await api.put('/auth/preferences', { onboardingComplete: true });
    } catch {
      // ignore
    }
    onSkip();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--surface)] rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="text-[var(--text-secondary)] hover:text-[var(--text)] p-1"
            aria-label="Skip onboarding"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            <div className="text-center mb-6">
              <step.icon className="w-10 h-10 text-[var(--accent)] mx-auto mb-3" />
              <h2 className="text-xl font-bold text-[var(--text)]">{step.title}</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{step.subtitle}</p>
            </div>

            <div className="grid gap-3">
              {step.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    isSelected(option.value)
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-medium text-[var(--text)]">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
          {isFirstStep ? (
            <button
              onClick={handleSkip}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text)]"
            >
              Skip for now
            </button>
          ) : (
            <Button variant="ghost" onClick={handleBack}>
              <ChevronLeft size={18} className="inline mr-1" />
              Back
            </Button>
          )}

          <Button onClick={handleNext} isLoading={isSubmitting}>
            {isLastStep ? "Let's Cook!" : 'Next'}
            {!isLastStep && <ChevronRight size={18} className="inline ml-1" />}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
