"use client";

import { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";

type AuthCardProps = {
  children: ReactNode;
  className?: string;
};

/** Shared white card used on login, signup, signout, and account screens. */
export function AuthCard({ children, className = "" }: AuthCardProps) {
  return (
    <div className={`auth-card p-8 sm:p-10 ${className}`}>
      <div className="mb-6 flex justify-center">
        <Logo variant="dashboard" href="/" showText />
      </div>
      {children}
    </div>
  );
}
