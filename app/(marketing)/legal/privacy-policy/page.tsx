import { LegalPage } from "@/components/legal/LegalPage";
import { LegalSection } from "@/components/legal/LegalSection";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How GroupBuy Tools collects, uses, and protects your personal information when you use our platform."
    >
      <LegalSection title="Overview" index={0}>
        <p>
          GroupBuy Tools respects your privacy. This policy describes what data
          we collect, why we collect it, and the choices you have regarding your
          information.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect" index={1}>
        <p>
          We collect your name, email address, payment information (processed
          securely by Stripe), and usage data related to your account and tool
          access sessions.
        </p>
      </LegalSection>

      <LegalSection title="How we use your data" index={2}>
        <p>
          Your information is used to provide and improve our services, process
          payments, communicate account updates, prevent fraud, and ensure
          platform security.
        </p>
      </LegalSection>

      <LegalSection title="Data sharing" index={3}>
        <p>
          We do not sell your personal data. We share information only with
          service providers necessary to operate the platform — such as payment
          processors, hosting providers, and authentication services — under
          strict data protection agreements.
        </p>
      </LegalSection>

      <LegalSection title="Your rights" index={0}>
        <p>
          You may request access to, correction of, or deletion of your personal
          data at any time by contacting our support team. EU and UK users may
          have additional rights under applicable privacy laws.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
