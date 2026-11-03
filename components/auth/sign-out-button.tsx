"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton({
  variant = "ghost",
  size = "sm",
  className,
  showIcon = true,
}: {
  variant?: "ghost" | "outline" | "default" | "secondary";
  size?: "xs" | "sm" | "default" | "lg";
  className?: string;
  showIcon?: boolean;
}) {
  const { signOut } = useAuthActions();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={async () => {
        await signOut();
        router.push("/");
      }}
    >
      {showIcon && <LogOut className="size-3.5" />}
      <span>Sign out</span>
    </Button>
  );
}
