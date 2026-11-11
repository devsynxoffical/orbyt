"use client";

import dynamic from "next/dynamic";
import { AdminAuthLayout } from "@/components/auth/AdminAuthLayout";
import { isMockMode } from "@/lib/config";

const AdminAuthForm = dynamic(
  () => import("@/components/auth/AdminAuthFormClient"),
  {
    ssr: false,
    loading: () => (
      <div className="auth-card animate-pulse p-8 sm:p-10">
        <div className="h-8 w-40 rounded-full bg-collab-gray" />
        <div className="mt-6 space-y-4">
          <div className="h-10 rounded-lg bg-collab-gray" />
          <div className="h-10 rounded-lg bg-collab-gray" />
          <div className="h-11 rounded-full bg-collab-dark/20" />
        </div>
      </div>
    ),
  }
);

export default function AdminLoginPage() {
  return (
    <AdminAuthLayout>
      {isMockMode() && (
        <div className="mb-6 rounded-xl border-2 border-collab-dark/10 bg-collab-yellow/20 px-4 py-3.5 text-sm text-collab-dark">
          <p className="font-bold">Demo admin (no DB required)</p>
          <p className="mt-1.5 text-collab-dark/80">
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">admin@demo.com</code>{" "}
            / <code className="rounded bg-white px-1.5 py-0.5 text-xs">demo1234</code>
          </p>
        </div>
      )}
      <AdminAuthForm />
    </AdminAuthLayout>
  );
}
