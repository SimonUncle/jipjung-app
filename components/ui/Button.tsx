"use client";

import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold
    shadow-lg shadow-blue-500/30
    hover:from-blue-400 hover:to-cyan-400
  `,
  secondary: `
    bg-white/10 text-white font-medium
    hover:bg-white/20
  `,
  ghost: `
    bg-transparent text-white/70
    hover:bg-white/10 hover:text-white
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold
    shadow-lg shadow-red-500/30
    hover:from-red-400 hover:to-orange-400
  `,
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "py-2 px-3 text-sm rounded-lg",
  md: "py-3 px-4 text-base rounded-xl",
  lg: "py-4 px-6 text-lg rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? "w-full" : ""}
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
