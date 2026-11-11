"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { PasswordField } from "./PasswordField";
import { FormError } from "./FormError";
import { AuthCard } from "./AuthCard";
import { useEffect, useState } from "react";
import { startNavigationProgress } from "@/lib/navigation-progress";
import { getAppBaseUrl } from "@/lib/config/site";

const SUSPENDED_MESSAGE =
  "Your account has been suspended. Please contact support for help.";

const LOCKED_MESSAGE =
  "Your account is locked after too many failed login attempts. Please contact an administrator to unblock it.";

export function AdminAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const appUrl = getAppBaseUrl();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "suspended") {
      setServerError(SUSPENDED_MESSAGE);
    } else if (err === "locked") {
      setServerError(LOCKED_MESSAGE);
    } else if (err === "sessionTaken") {
      setServerError(
        "This account was signed in on another device or IP. Only one active login is allowed — please sign in again."
      );
    } else if (err === "ipChanged") {
      setServerError(
        "Your network/IP changed while logged in. For security, please sign in again."
      );
    } else if (err === "sessionExpired") {
      setServerError("Your session expired. Please sign in again.");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const isBusy = isSubmitting || isRedirecting;

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError(
        result.error === "CredentialsSignin"
          ? "Invalid email or password."
          : result.error === "SUSPENDED_ACCOUNT"
            ? SUSPENDED_MESSAGE
            : result.error === "LOCKED_ACCOUNT"
              ? LOCKED_MESSAGE
              : result.error
      );
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();

    if (sessionData?.user?.role !== "ADMIN") {
      await signOut({ redirect: false });
      setServerError(
        "This portal is for administrators only. Please use the main site to sign in."
      );
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl");

    setIsRedirecting(true);
    startNavigationProgress();
    router.push(callbackUrl ?? "/admin");
    router.refresh();
  };

  return (
    <AuthCard>
      <h1 className="text-2xl font-extrabold text-collab-dark">Admin login</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Sign in to manage users, tools, and payments.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-neutral-800"
          >
            Admin email
          </label>
          <input
            id="email"
            type="email"
            placeholder="admin@platform.com"
            className={`input-field ${errors.email ? "input-field-error" : ""}`}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-danger-500">{errors.email.message}</p>
          )}
        </div>

        <PasswordField
          id="password"
          label="Password"
          registration={register("password")}
          error={errors.password?.message}
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
              ? "Signing in..."
              : "Sign in to admin"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Not an admin?{" "}
        <Link
          href={`${appUrl}/login`}
          className="font-bold text-collab-dark transition-colors hover:text-collab-dark/70"
        >
          User login
        </Link>
      </p>
    </AuthCard>
  );
}
