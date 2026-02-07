"use client";

type ProgressVariant = "primary" | "success" | "warning" | "amber";
type ProgressSize = "sm" | "md" | "lg";

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const variantClasses: Record<ProgressVariant, string> = {
  primary: "bg-gradient-to-r from-cyan-400 to-blue-500",
  success: "bg-gradient-to-r from-green-400 to-emerald-500",
  warning: "bg-gradient-to-r from-orange-400 to-red-500",
  amber: "bg-gradient-to-r from-amber-400 to-orange-500",
};

const sizeClasses: Record<ProgressSize, string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({
  value,
  max = 100,
  variant = "primary",
  size = "md",
  showLabel = false,
  label,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm text-white/60">{label}</span>}
          {showLabel && (
            <span className="text-sm text-white/60">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`${sizeClasses[size]} bg-white/10 rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`h-full ${variantClasses[variant]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
