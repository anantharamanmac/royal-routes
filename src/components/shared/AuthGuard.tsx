"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/types";

interface GuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  allowedRoles,
  redirectTo = "/login",
}: GuardProps) {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(redirectTo);
      return;
    }
    if (allowedRoles && appUser && !allowedRoles.includes(appUser.role)) {
      // Redirect to their home based on role
      if (appUser.role === "master_admin") router.replace("/admin/dashboard");
      else if (appUser.role === "destination_admin") router.replace("/admin/dashboard");
      else router.replace("/dashboard");
    }
  }, [user, appUser, loading, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-royal-200 border-t-royal-600 animate-spin" />
          <p className="text-stone-500 font-body text-sm">Loading Royal Routes…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles && appUser && !allowedRoles.includes(appUser.role)) return null;

  return <>{children}</>;
}

