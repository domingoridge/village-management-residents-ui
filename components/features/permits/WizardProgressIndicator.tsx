/**
 * WizardProgressIndicator Component
 *
 * Displays progress through the permit application wizard steps.
 */

import { cn } from "@/lib/utils/cn";

export interface WizardProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: {
    number: number;
    label: string;
    description?: string;
  }[];
  className?: string;
}

export function WizardProgressIndicator({
  currentStep,
  totalSteps,
  steps,
  className,
}: WizardProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("w-full", className)} data-testid="wizard-progress">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-neutral">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-neutral/70">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral/10">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-label={`Step ${currentStep} of ${totalSteps}`}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isUpcoming = step.number > currentStep;

          return (
            <div
              key={step.number}
              className={cn("flex flex-1 flex-col items-center", {
                "opacity-50": isUpcoming,
              })}
            >
              {/* Step circle */}
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  {
                    "border-primary-500 bg-primary-500 text-white":
                      isCompleted || isCurrent,
                    "border-neutral/20 bg-white text-neutral/50": isUpcoming,
                  },
                )}
                data-testid={`step-indicator-${step.number}`}
              >
                {isCompleted ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>

              {/* Step label */}
              <div className="mt-2 text-center">
                <p
                  className={cn("text-sm font-medium", {
                    "text-neutral": isCurrent,
                    "text-neutral/50": !isCurrent,
                  })}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="mt-0.5 text-xs text-neutral/70">
                    {step.description}
                  </p>
                )}
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-5 h-0.5 w-full -translate-x-1/2 transform",
                    {
                      "bg-primary-500": isCompleted,
                      "bg-neutral/20": !isCompleted,
                    },
                  )}
                  style={{
                    left: `${((index + 1) / steps.length) * 100}%`,
                    width: `${100 / steps.length}%`,
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
