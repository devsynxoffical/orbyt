import dynamic from "next/dynamic";
import { AuthLayout } from "@/components/auth/AuthLayout";

const ForgotPasswordForm = dynamic(
  () => import("@/components/auth/ForgotPasswordFormClient"),
  {
    ssr: false,
    loading: () => (
      <div className="auth-card animate-pulse p-8 sm:p-10">
        <div className="h-8 w-48 rounded-full bg-collab-yellow/40" />
        <div className="mt-6 space-y-4">
          <div className="h-10 rounded-lg bg-collab-gray" />
          <div className="h-11 rounded-full bg-collab-yellow/20" />
        </div>
      </div>
    ),
  }
);

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset access"
      subtitle="We'll email you a secure link to set a new password."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
