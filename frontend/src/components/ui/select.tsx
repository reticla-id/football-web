"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      `
      flex h-11 w-full items-center justify-between
      -xl
      border border-zinc-800
      bg-zinc-950/75
      px-4
      text-sm
      font-medium
      text-zinc-200

      transition-all
      duration-200

      hover:border-zinc-600
      hover:bg-zinc-900

      focus:outline-none
      focus-accent

      data-[state=open]:[border-color:var(--accent)]
      data-[state=open]:bg-zinc-900
      `,
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon className="transition-transform duration-200 data-[state=open]:rotate-180">
      <ChevronDown className="h-4 w-4 text-zinc-500" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));

SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", sideOffset = 6, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      position={position}
      collisionPadding={12}
      className={cn(
        `
        z-50
        min-w-[var(--radix-select-trigger-width)]
        w-[var(--radix-select-trigger-width)]
        max-w-[calc(100vw-24px)]

        overflow-hidden
        -xl
        border
        border-zinc-800
        bg-zinc-950/98
        shadow-[0_22px_60px_rgba(0,0,0,0.4)]
        `,
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="max-h-72 p-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));

SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      `
      relative
      flex
      cursor-pointer
      select-none
      items-center

      -lg

      px-3
      py-2.5

      text-sm

      transition-colors

      outline-none

      hover:bg-zinc-900
      hover:text-white

      focus:bg-zinc-900
      focus:text-white

      data-[state=checked]:bg-[color:var(--accent-soft)]
      data-[state=checked]:text-[color:var(--accent)]
      `,
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="accent-text h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));

SelectItem.displayName = SelectPrimitive.Item.displayName;
