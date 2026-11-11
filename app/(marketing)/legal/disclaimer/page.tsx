import { LegalPage } from "@/components/legal/LegalPage";
import { LegalSection } from "@/components/legal/LegalSection";

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      description="Important information about Orbyt Rush, third-party software, and limitations of our service."
    >
      <LegalSection title="Third-party affiliation" index={0}>
        <p>
          Orbyt Rush is an independent platform that provides access to
          third-party SEO software. We are not affiliated with, endorsed by, or
          sponsored by Ahrefs, Semrush, Moz, or any other tool vendor unless
          explicitly stated.
        </p>
      </LegalSection>

      <LegalSection title="Tool availability" index={1}>
        <p>
          Tool access depends on the terms of our group licenses and vendor
          policies. We cannot guarantee uninterrupted access to any specific tool
          and may substitute comparable tools when necessary.
        </p>
      </LegalSection>

      <LegalSection title="No warranty" index={2}>
        <p>
          The platform and tools are provided &ldquo;as is&rdquo; without
          warranties of any kind, express or implied. We are not liable for
          business decisions made based on data from third-party tools.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability" index={3}>
        <p>
          Our total liability for any claim arising from your use of the service
          is limited to the amount you paid for your subscription in the
          preceding 12 months.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
