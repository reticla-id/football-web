import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const baseClassName =
  "focus-accent inline-flex items-center justify-center text-sm font-semibold tracking-[0.02em] transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

const variants = {
  default:
    "border-[var(--accent)] bg-[var(--accent)] text-black hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] shadow-[0_10px_30px_color-mix(in_srgb,var(--accent)_35%,transparent)]",

  outline:
    "border-zinc-700 bg-zinc-950/70 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-900",

  ghost:
    "border-transparent bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-white",
};

const sizes = {
  default: "h-11 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-12 px-6",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(baseClassName, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
