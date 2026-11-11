import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const footerLinks = {
  menu: [
    { href: "/", label: "Overview" },
    { href: "/tools", label: "All Tools" },
    { href: "/pricing", label: "Pricing & Plans" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Support & Contact" },
  ],
  product: [
    { href: "/tools", label: "Browser Launcher" },
    { href: "/pricing", label: "1 to 30-Day Passes" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/signup", label: "Create Account" },
    { href: "/login", label: "Member Login" },
  ],
  legal: [
    { href: "/legal/terms", label: "Terms of Service" },
    { href: "/legal/privacy-policy", label: "Privacy Policy" },
    { href: "/legal/disclaimer", label: "Disclaimer" },
    { href: "/legal/refund-policy", label: "Refund Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200/80 bg-white pt-16 pb-12 text-neutral-600">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-4">
            <div className="flex items-center">
              <Logo showText variant="light" size="lg" />
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-500">
              Orbyt Rush delivers high-velocity access to world-class SEO, research,
              and growth tools. Pay only for what you use, launch with one click,
              and bypass costly annual commitments.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="mailto:support@orbytrush.com"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-700 transition-all duration-200 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
                aria-label="Email support"
              >
                <MaterialIcon name="mail" className="text-lg" />
              </a>
              <Link
                href="/contact"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-700 transition-all duration-200 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
                aria-label="Contact"
              >
                <MaterialIcon name="chat" className="text-lg" />
              </Link>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.menu.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Tools &amp; Passes
            </h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 3 */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Legal &amp; Trust
            </h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA column */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Ready to Rush?
            </h4>
            <p className="mt-4 text-xs leading-relaxed text-neutral-500">
              Create your account in seconds and unlock immediate tool passes.
            </p>
            <Link
              href="/signup"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-neutral-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-black"
            >
              Start free trial
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-neutral-200/80 pt-8 sm:flex-row">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} Orbyt Rush. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-neutral-500">
            <span>Enterprise-grade security</span>
            <span>&bull;</span>
            <span>Instant activation</span>
            <span>&bull;</span>
            <span>24/7 Monitoring</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
