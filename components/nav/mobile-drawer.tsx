"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

/**
 * Slide-in drawer behind a hamburger button, used by both the public site
 * header and the signed-in dashboard header. Built on Radix Dialog so focus
 * is trapped, Escape closes it, and the page behind does not scroll. It
 * closes itself on navigation, since a Link inside it does not unmount it.
 */
export function MobileDrawer({
  label = "Menu",
  title,
  children,
  side = "right",
  triggerClassName = "",
}: {
  label?: string;
  title: React.ReactNode;
  children: React.ReactNode;
  side?: "left" | "right";
  triggerClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close when the route changes (a nav Link was followed). Adjusting state
  // during render, keyed on the previous path, is React's recommended
  // alternative to a setState-in-effect.
  const [lastPath, setLastPath] = React.useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={`Open ${label.toLowerCase()}`}
          className={`inline-flex size-10 items-center justify-center rounded-md border border-rule text-ink-2 transition-colors hover:bg-raised ${triggerClassName}`}
        >
          <Menu className="size-5" />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={`fixed inset-y-0 z-50 flex w-[min(20rem,88vw)] flex-col bg-surface shadow-xl outline-none duration-200 data-open:animate-in data-closed:animate-out ${
            side === "right"
              ? "right-0 border-l border-rule data-open:slide-in-from-right data-closed:slide-out-to-right"
              : "left-0 border-r border-rule data-open:slide-in-from-left data-closed:slide-out-to-left"
          }`}
        >
          <div className="flex items-center justify-between border-b border-rule px-5 py-3.5">
            <DialogPrimitive.Title asChild>
              <div>{title}</div>
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Close menu"
                className="inline-flex size-10 items-center justify-center rounded-md text-ink-2 transition-colors hover:bg-raised"
              >
                <X className="size-5" />
              </button>
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
