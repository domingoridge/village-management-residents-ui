/**
 * useWizardStep Hook
 *
 * Manages wizard step navigation state for multi-step forms.
 */

import { useState, useCallback } from "react";

export type WizardStep = 1 | 2 | 3;

export interface UseWizardStepReturn {
  currentStep: WizardStep;
  totalSteps: number;
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: WizardStep) => void;
  canGoNext: boolean;
  canGoBack: boolean;
}

export interface UseWizardStepOptions {
  initialStep?: WizardStep;
  totalSteps?: number;
  onStepChange?: (step: WizardStep) => void;
}

/**
 * Hook for managing wizard step navigation
 */
export function useWizardStep(
  options: UseWizardStepOptions = {},
): UseWizardStepReturn {
  const { initialStep = 1, totalSteps = 3, onStepChange } = options;

  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);

  const progress = (currentStep / totalSteps) * 100;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const canGoNext = currentStep < totalSteps;
  const canGoBack = currentStep > 1;

  const goToNextStep = useCallback(() => {
    if (canGoNext) {
      const nextStep = (currentStep + 1) as WizardStep;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    }
  }, [currentStep, canGoNext, onStepChange]);

  const goToPreviousStep = useCallback(() => {
    if (canGoBack) {
      const previousStep = (currentStep - 1) as WizardStep;
      setCurrentStep(previousStep);
      onStepChange?.(previousStep);
    }
  }, [currentStep, canGoBack, onStepChange]);

  const goToStep = useCallback(
    (step: WizardStep) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
        onStepChange?.(step);
      }
    },
    [totalSteps, onStepChange],
  );

  return {
    currentStep,
    totalSteps,
    progress,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    canGoNext,
    canGoBack,
  };
}
