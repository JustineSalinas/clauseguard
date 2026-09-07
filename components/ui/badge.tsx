import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[4px] border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[#08090a] text-white",
        secondary:
          "bg-[#f2f2f2] text-[#08090a] border border-[#dddddd]",
        destructive:
          "bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]",
        outline:
          "border-[#dddddd] text-[#000000] bg-white",
        ghost:
          "hover:bg-[#f2f2f2] text-[#525866]",
        mint:
          "bg-[#eefaf4] text-[#0c8c5e] border border-[#bbf0d6]",
        caution:
          "bg-[#fffbeb] text-[#d97706] border border-[#fde68a]",
        link: "text-[#b04000] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
