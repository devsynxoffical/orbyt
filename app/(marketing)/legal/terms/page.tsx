import { LegalPage } from "@/components/legal/LegalPage";
import { LegalSection } from "@/components/legal/LegalSection";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These terms govern your use of Orbyt Rush. By creating an account or subscribing, you agree to the rules below."
    >
      <LegalSection title="Overview" index={0}>
        <p>
          These Terms of Service govern your use of the Orbyt Rush platform.
          By creating an account or subscribing to a plan, you agree to these
          terms in full.
        </p>
      </LegalSection>

      <LegalSection title="Service description" index={1}>
        <p>
          Orbyt Rush provides access to third-party SEO software through
          shared group licenses. Access is granted for the duration of an active
          subscription and may vary by plan tier.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use" index={2}>
        <p>
          You may not resell, sublicense, or share your account credentials with
          others. Abuse of tool access, automated scraping beyond fair use, or
          violation of third-party tool terms may result in immediate suspension
          without refund.
        </p>
      </LegalSection>

      <LegalSection title="Account responsibility" index={3}>
        <p>
          You are responsible for maintaining the confidentiality of your login
          credentials and for all activity under your account. Notify us
          immediately if you suspect unauthorized access.
        </p>
      </LegalSection>

      <LegalSection title="Modifications" index={0}>
        <p>
          We reserve the right to update these terms at any time. Material
          changes will be communicated via email or an in-app notice. Continued
          use after changes constitutes acceptance of the revised terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
