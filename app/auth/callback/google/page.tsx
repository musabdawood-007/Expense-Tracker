"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "../../../components/AuthContext";

function GoogleCallbackHandler() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userStr = searchParams.get("user");
    const error = searchParams.get("error");

    if (error) {
      router.push("/auth/login?error=" + error);
      return;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        localStorage.setItem("user", JSON.stringify({ ...user, verified: true }));
        window.location.href = "/dashboard";
      } catch {
        router.push("/auth/login?error=parse_failed");
      }
    }
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin mx-auto mb-4" />
        <p className="text-[14px] text-muted">Signing you in...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
      </div>
    }>
      <GoogleCallbackHandler />
    </Suspense>
  );
}
