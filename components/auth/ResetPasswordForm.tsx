"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PasswordField } from "./PasswordField";
import { FormError } from "./FormError";
import { AuthCard } from "./AuthCard";
import { startNavigationProgress } from "@/lib/navigation-progress";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormInput = z.infer<typeof formSchema>;

type ResetPasswordFormProps = {
  token: string;
  tokenValid: boolean;
};

export function ResetPasswordForm({ token, tokenValid }: ResetPasswordFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
  });

  const isBusy = isSubmitting || isRedirecting;

  if (!token || !tokenValid) {
    return (
      <AuthCard>
        <h1 className="text-2xl font-extrabold text-collab-dark">
          Invalid reset link
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          This password reset link is invalid or has expired. Request a new one
          to continue.
        </p>
        <div className="mt-8 space-y-3">
          <Link href="/forgot-password" className="btn-primary inline-flex w-full">
            Request new link
          </Link>
          <Link
            href="/login"
            className="block text-center text-sm font-bold text-collab-dark hover:text-collab-dark/70"
          >
            Back to login
          </Link>
        </div>
      </AuthCard>
    );
  }

  const onSubmit = async (data: FormInput) => {
    setServerError(null);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setServerError(json.error ?? "Could not reset password.");
      return;
    }

    setIsRedirecting(true);
    startNavigationProgress();
    router.push("/login?reset=1");
    router.refresh();
  };

  return (
    <AuthCard>
      <h1 className="text-2xl font-extrabold text-collab-dark">
        Set a new password
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Choose a strong password for your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <PasswordField
          id="password"
          label="New password"
          registration={register("password")}
          error={errors.password?.message}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm new password"
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <FormError message={serverError ?? undefined} />

        <button
          type="submit"
          disabled={isBusy}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRedirecting
            ? "Redirecting..."
            : isSubmitting
              ? "Updating..."
              : "Update password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        <Link
          href="/login"
          className="font-bold text-collab-dark transition-colors hover:text-collab-dark/70"
        >
          Back to login
        </Link>
      </p>
    </AuthCard>
  );
}
