import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full -xl border border-zinc-800 bg-zinc-950/75 px-4 py-2 text-sm text-zinc-100 outline-none ring-offset-zinc-950 placeholder:text-zinc-500 transition-colors hover:border-zinc-700 focus:border-zinc-700 focus-visible:ring-0 focus-visible:ring-offset-0",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
