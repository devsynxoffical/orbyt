import dynamic from "next/dynamic";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { isResetTokenValid } from "@/lib/auth/password-reset";

const ResetPasswordForm = dynamic(
  () => import("@/components/auth/ResetPasswordFormClient"),
  {
    ssr: false,
    loading: () => (
      <div className="auth-card animate-pulse p-8 sm:p-10">
        <div className="h-8 w-48 rounded-full bg-collab-yellow/40" />
        <div className="mt-6 space-y-4">
          <div className="h-10 rounded-lg bg-collab-gray" />
          <div className="h-10 rounded-lg bg-collab-gray" />
          <div className="h-11 rounded-full bg-collab-yellow/20" />
        </div>
      </div>
    ),
  }
);

type Props = {
  searchParams: { token?: string };
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const token = searchParams.token?.trim() ?? "";
  const tokenValid = token ? await isResetTokenValid(token) : false;

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Your reset link is one-time and expires after one hour."
    >
      <ResetPasswordForm token={token} tokenValid={tokenValid} />
    </AuthLayout>
  );
}
