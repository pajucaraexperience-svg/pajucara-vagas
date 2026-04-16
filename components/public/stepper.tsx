"use client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { stepperSteps } from "@/lib/content/messages";

export function Stepper({ current }: { current: number }) {
  return (
    <div className="border-b border-cream-300 bg-white">
      <div className="container-narrow py-5">
        <ol className="flex w-full items-center gap-2 overflow-x-auto">
          {stepperSteps.map((step, i) => {
            const isDone = i < current;
            const isCurrent = i === current;
            return (
              <li key={step.key} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isDone && "bg-teal text-white",
                    isCurrent && "border-2 border-teal bg-white text-teal",
                    !isDone && !isCurrent && "border border-cream-300 bg-cream-100 text-sand-dark",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-xs sm:inline",
                    isCurrent ? "font-medium text-teal-dark" : "text-sand-dark",
                  )}
                >
                  {step.title}
                </span>
                {i < stepperSteps.length - 1 && (
                  <span
                    className={cn(
                      "ml-1 hidden h-px flex-1 sm:inline-block",
                      isDone ? "bg-teal" : "bg-cream-300",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
