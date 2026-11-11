"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { FormError } from "./FormError";
import { AuthCard } from "./AuthCard";

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [debugResetUrl, setDebugResetUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);
    setSuccessMessage(null);
    setDebugResetUrl(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setServerError(json.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSuccessMessage(
      json.message ??
        "If an account exists for that email, we sent password reset instructions."
    );
    if (typeof json.debugResetUrl === "string") {
      setDebugResetUrl(json.debugResetUrl);
    }
  };

  return (
    <AuthCard>
      <h1 className="text-2xl font-extrabold text-collab-dark">
        Forgot password
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Enter your account email and we&apos;ll send a reset link.
      </p>

      {successMessage ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successMessage}
          </div>
          {debugResetUrl && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-bold">Dev mode — email not configured</p>
              <p className="mt-2 break-all">
                <Link
                  href={debugResetUrl}
                  className="font-bold text-collab-yellow underline"
                >
                  Open reset link
                </Link>
              </p>
            </div>
          )}
          <Link href="/login" className="btn-primary inline-flex w-full">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-neutral-800"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              className={`input-field ${errors.email ? "input-field-error" : ""}`}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-danger-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <FormError message={serverError ?? undefined} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-neutral-600">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-bold text-collab-dark transition-colors hover:text-collab-dark/70"
        >
          Login
        </Link>
      </p>
    </AuthCard>
  );
}
