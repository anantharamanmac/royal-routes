"use client";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-ivory-100 flex items-center justify-center mb-5 text-stone-400">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-stone-700 mb-2">{title}</h3>
      {description && (
        <p className="text-stone-400 text-sm max-w-sm leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-5 py-2.5 bg-royal-gradient text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-premium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

