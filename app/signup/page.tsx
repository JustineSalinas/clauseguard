import type { Metadata } from "next";
import { AuthView } from "@/components/auth/auth-view";

export const metadata: Metadata = {
  title: "Create an account | ClauseGuard",
  description: "Create your free ClauseGuard account to review contracts grounded in Philippine statutory law.",
};

export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectTarget = next ?? "/dashboard";

  return <AuthView initialMode="signup" next={redirectTarget} />;
}
