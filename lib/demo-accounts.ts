export const DEMO_ACCOUNT_EMAILS = ["user@demo.com", "admin@demo.com"] as const;

export function isDemoAccountEmail(email: string): boolean {
  return DEMO_ACCOUNT_EMAILS.includes(
    email.toLowerCase() as (typeof DEMO_ACCOUNT_EMAILS)[number]
  );
}
