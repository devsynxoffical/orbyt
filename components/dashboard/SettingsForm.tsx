"use client";

import { useState } from "react";
import { changePassword } from "@/lib/actions/admin-account";
import { PasswordField } from "@/components/auth/PasswordField";
import { FormError } from "@/components/auth/FormError";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export function SettingsForm({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordForm) => {
    setServerError(null);
    setSuccess(false);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      setSuccess(true);
      reset();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="dashboard-panel-modern p-6">
        <h2 className="text-sm font-semibold text-neutral-900">Profile</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Your public account information
        </p>
        <div className="mt-5 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-collab-yellow text-lg font-bold text-neutral-950 ring-2 ring-amber-300">
            {initials}
          </span>
          <div>
            <p className="font-medium text-neutral-900">{name}</p>
            <p className="text-sm text-neutral-500">{email}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-neutral-400">
          Contact support to change your email address.
        </p>
      </div>

      <div className="dashboard-panel-modern p-6">
        <h2 className="text-sm font-semibold text-neutral-900">Security</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Update your password to keep your account secure
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <PasswordField
            id="currentPassword"
            label="Current password"
            registration={register("currentPassword")}
            error={errors.currentPassword?.message}
          />
          <PasswordField
            id="newPassword"
            label="New password"
            registration={register("newPassword")}
            error={errors.newPassword?.message}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirm new password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
          <FormError message={serverError ?? undefined} />
          {success && (
            <p className="rounded-lg bg-accent-500/10 px-3 py-2 text-sm text-accent-600">
              Password updated successfully.
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function SettingsPageClient({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  return <SettingsForm email={email} name={name} />;
}
