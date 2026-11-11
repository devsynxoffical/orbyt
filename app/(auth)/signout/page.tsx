import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignOutForm } from "@/components/auth/SignOutForm";

export default function SignOutPage() {
  return (
    <AuthLayout
      title="See you soon"
      subtitle="Sign out securely from your GroupBuy Tools account. You can log back in anytime."
    >
      <SignOutForm />
    </AuthLayout>
  );
}
