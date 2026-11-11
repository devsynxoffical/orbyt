"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from "@/lib/validations/auth";
import { PasswordField } from "./PasswordField";
import { FormError } from "./FormError";
import { AuthCard } from "./AuthCard";
import { useEffect, useState } from "react";
import { startNavigationProgress } from "@/lib/navigation-progress";

const SUSPENDED_MESSAGE =
  "Your account has been suspended. Please contact support for help.";

const LOCKED_MESSAGE =
  "Your account is locked after too many failed login attempts. Please contact an administrator to unblock it.";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isSignup = mode === "signup";

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
  } = useForm<SignupInput | LoginInput>({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
  });

  const isBusy = isSubmitting || isRedirecting;

  const onSubmit = async (data: SignupInput | LoginInput) => {
    setServerError(null);

    try {
      if (isSignup) {
        const signupData = data as SignupInput;
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: signupData.name,
            email: signupData.email,
            password: signupData.password,
          }),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setServerError(
            (json as { error?: string }).error ??
              "Something went wrong. Please try again."
          );
          return;
        }
      }

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

      // signIn can return ok:false with no error when the server throws (e.g. DB down)
      if (result && result.ok === false) {
        setServerError(
          "Sign-in failed. The server could not reach the database. Please try again."
        );
        return;
      }

      const callbackUrl = searchParams.get("callbackUrl");
      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) {
        setServerError(
          "Signed in, but session could not be loaded. Please refresh and try again."
        );
        return;
      }
      const sessionData = await sessionRes.json();
      const isAdmin = sessionData?.user?.role === "ADMIN";

      if (!isSignup && isAdmin) {
        await signOut({ redirect: false });
        setServerError(
          "Administrator accounts must sign in through the admin portal."
        );
        return;
      }

      setIsRedirecting(true);
      startNavigationProgress();

      // Hard navigation avoids stuck "Loading..." when soft RSC navigation fails.
      const dest = callbackUrl?.startsWith("/") ? callbackUrl : "/dashboard";
      window.location.assign(dest);
    } catch (err: unknown) {
      setIsRedirecting(false);
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Sign-in failed due to a temporary network issue. Please check your connection and try again.";
      setServerError(message);
    }
  };

  return (
    <AuthCard>
      <h1 className="text-2xl font-extrabold text-collab-dark">
        {isSignup ? "Create account" : "Login"}
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        {isSignup
          ? "Sign up to browse tools on the platform."
          : "Sign in to view your tools and subscription."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        {isSignup && (
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-neutral-800"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Ahmad Safdar"
              className={`input-field ${
                "name" in errors && errors.name ? "input-field-error" : ""
              }`}
              {...register("name" as keyof SignupInput)}
            />
            {"name" in errors && errors.name && (
              <p className="mt-1.5 text-xs text-danger-500">
                {errors.name.message}
              </p>
            )}
          </div>
        )}

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

        <PasswordField
          id="password"
          label="Password"
          registration={register("password")}
          error={errors.password?.message}
        />

        {!isSignup && (
          <div className="-mt-2 flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-bold text-neutral-700 hover:text-neutral-950 underline"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {isSignup && (
          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            registration={register("confirmPassword" as keyof SignupInput)}
            error={
              "confirmPassword" in errors
                ? errors.confirmPassword?.message
                : undefined
            }
          />
        )}

        <FormError message={serverError ?? undefined} />
        {(serverError === SUSPENDED_MESSAGE ||
          serverError === LOCKED_MESSAGE) && (
          <p className="text-center text-sm text-neutral-600">
            <Link
              href="/contact"
              className="font-bold text-collab-dark underline hover:text-collab-dark/70"
            >
              Contact support
            </Link>
          </p>
        )}

        {!isSignup && searchParams.get("reset") === "1" && !serverError && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Password updated. Sign in with your new password.
          </div>
        )}

        <button
          type="submit"
          disabled={isBusy}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRedirecting
            ? "Redirecting..."
            : isSubmitting
              ? isSignup
                ? "Creating account..."
                : "Signing in..."
              : isSignup
                ? "Create account"
                : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-collab-dark transition-colors hover:text-collab-dark/70"
            >
              Login
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-collab-dark transition-colors hover:text-collab-dark/70"
            >
              Create account
            </Link>
          </>
        )}
      </p>
    </AuthCard>
  );
}
