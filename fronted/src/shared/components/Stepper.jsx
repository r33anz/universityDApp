import React from "react";
import { CheckIcon } from "./Icons";

export function Stepper({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <div className={`w-12 sm:w-20 h-px mx-1 transition-colors duration-300 ${
                isCompleted ? "bg-brand-teal" : "bg-gray-200 dark:bg-white/10"
              }`} />
            )}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                isCompleted
                  ? "bg-brand-teal text-white"
                  : isActive
                    ? "bg-brand-blue text-white shadow-md shadow-brand-blue/25"
                    : "bg-gray-200 dark:bg-white/10 theme-text-tertiary"
              }`}>
                {isCompleted ? <CheckIcon className="w-3.5 h-3.5" /> : stepNum}
              </div>
              <span className={`text-sm font-medium hidden sm:inline transition-colors duration-300 ${
                isActive ? "theme-text" : isCompleted ? "text-brand-teal" : "theme-text-tertiary"
              }`}>
                {label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
