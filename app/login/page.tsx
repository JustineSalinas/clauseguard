import type { Metadata } from "next";
import { AuthView } from "@/components/auth/auth-view";

export const metadata: Metadata = {
  title: "Sign in | ClauseGuard",
  description: "Sign in to review your freelance contracts against Philippine statutory law.",
};

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const redirectTarget = next ?? "/dashboard";

  return <AuthView initialMode="signin" next={redirectTarget} error={error} />;
}
