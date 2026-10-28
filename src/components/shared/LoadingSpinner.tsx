import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "default" | "gold" | "white";
  className?: string;
}

const sizeClass = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-4",
};

const colorClass = {
  default: "border-royal-200 border-t-royal-600",
  gold: "border-gold-200 border-t-gold-500",
  white: "border-white/30 border-t-white",
};

export default function LoadingSpinner({
  size = "md",
  color = "default",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "rounded-full animate-spin",
        sizeClass[size],
        colorClass[color],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-stone-500 font-body text-sm">Loading Royal Routes…</p>
      </div>
    </div>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card-premium p-5 space-y-3">
      <div className="skeleton h-5 w-2/3" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className={cn("skeleton h-4", i === lines - 2 ? "w-1/2" : "w-full")} />
      ))}
    </div>
  );
}

