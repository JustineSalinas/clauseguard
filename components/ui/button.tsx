import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[4px] border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#08090a] text-white hover:bg-[#1a1c1e] shadow-[0_2px_4px_rgba(8,9,10,0.04)]",
        outline:
          "border border-[#dddddd] bg-white text-[#000000] hover:bg-[#f2f2f2] hover:border-[#cccccc]",
        secondary:
          "bg-[#f2f2f2] text-[#08090a] hover:bg-[#e8e8e8]",
        ghost:
          "text-[#000000] hover:bg-[#f2f2f2]",
        destructive:
          "bg-[#dc2626] text-white hover:bg-[#b91c1c]",
        link: "text-[#b04000] underline-offset-4 hover:underline",
        // Brand copper, for the rare CTA that should read as ClauseGuard's
        // own colour rather than the neutral ink-black default action.
        brand:
          "bg-[#b04000] text-white hover:bg-[#8a3300] shadow-[0_2px_4px_rgba(8,9,10,0.04)]",
      },
      size: {
        default:
          "h-9 gap-2 px-3.5 text-[0.875rem]",
        xs: "h-6 gap-1 rounded-[4px] px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1.5 rounded-[4px] px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 rounded-[4px] px-4 text-[0.9375rem]",
        icon: "size-9 rounded-[4px]",
        hero: "h-11 gap-2 rounded-[4px] px-5 text-[0.9375rem] font-medium tracking-tight",
        "icon-xs": "size-6 rounded-[4px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[4px]",
        "icon-lg": "size-10 rounded-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
