import dynamic from "next/dynamic";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { isMockMode } from "@/lib/config";

const AuthForm = dynamic(() => import("@/components/auth/AuthFormClient"), {
  ssr: false,
  loading: () => (
    <div className="auth-card animate-pulse p-8 sm:p-10">
      <div className="h-8 w-48 rounded-full bg-collab-yellow" />
      <div className="mt-6 space-y-4">
        <div className="h-10 rounded-lg bg-collab-gray" />
        <div className="h-10 rounded-lg bg-collab-gray" />
        <div className="h-10 rounded-lg bg-collab-gray" />
        <div className="h-11 rounded-full bg-collab-dark/20" />
      </div>
    </div>
  ),
});

export default function SignupPage() {
  return (
    <AuthLayout
      title="Join Orbyt Rush"
      subtitle="Create your account to browse tools and get access granted by your administrator."
    >
      {isMockMode() && (
        <div className="mb-6 rounded-xl border-2 border-collab-dark/10 bg-collab-yellow/50 px-4 py-3.5 text-sm text-collab-dark">
          <p className="font-bold">Demo mode</p>
          <p className="mt-1 text-collab-dark/80">
            Or sign in as{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">
              user@demo.com
            </code>{" "}
            / demo1234
          </p>
        </div>
      )}
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}
