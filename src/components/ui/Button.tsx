import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors min-h-[var(--touch-min)] px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";
    const variants = {
      primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90",
      secondary: "bg-[var(--color-surface-secondary)] text-[var(--color-text)] border border-[var(--color-border)]",
      ghost: "text-[var(--color-primary)] hover:bg-[var(--color-surface-secondary)]",
    };
    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
