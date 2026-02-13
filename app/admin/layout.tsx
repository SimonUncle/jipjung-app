"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || user?.email !== ADMIN_EMAIL) {
      router.replace("/");
      return;
    }

    setAuthorized(true);
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !authorized) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-900 to-blue-950 min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
