"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const sizeConfig = {
  sm: {
    track: "w-10 h-5",
    thumb: "w-3.5 h-3.5",
    translateChecked: "translate-x-5",
    translateUnchecked: "translate-x-0.5",
  },
  md: {
    track: "w-12 h-6",
    thumb: "w-4 h-4",
    translateChecked: "translate-x-7",
    translateUnchecked: "translate-x-1",
  },
};

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  className = "",
}: ToggleProps) {
  const config = sizeConfig[size];

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {(label || description) && (
        <div className="flex-1 mr-3">
          {label && <p className="text-white font-medium">{label}</p>}
          {description && (
            <p className="text-xs text-white/60">{description}</p>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          ${config.track} rounded-full transition-colors relative
          ${checked ? "bg-cyan-500" : "bg-white/20"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900
        `}
      >
        <div
          className={`
            absolute top-1 ${config.thumb} bg-white rounded-full
            transition-transform shadow-sm
            ${checked ? config.translateChecked : config.translateUnchecked}
          `}
        />
      </button>
    </div>
  );
}
