import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function ExtensionShowcaseSection() {
  return (
    <section className="bg-[#EDE9FE] py-20 sm:py-28 border-b border-purple-200/70">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column: Copy & Checklist */}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-300 bg-white/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-900 shadow-2xs backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-700" />
              <span>Streamlined Launchpad</span>
            </div>

            <h2 className="mt-5 text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 leading-[1.12]">
              Your SEO &amp; outreach stack. <br />
              <span className="text-purple-950">Finally organized.</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-neutral-700">
              Stop juggling shared spreadsheets, broken browser cookies, and expired passwords. Orbyt Rush centralizes every enterprise tool into a secure, single-click orbit.
            </p>

            {/* Checklist */}
            <div className="mt-8 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white mt-0.5">
                  <MaterialIcon name="check" className="text-sm" />
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  1-Click automated login via the secure Orbyt Rush Chrome extension
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white mt-0.5">
                  <MaterialIcon name="check" className="text-sm" />
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  Flexible 1, 3, 7, and 30-day on-demand passes tailored to project scope
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white mt-0.5">
                  <MaterialIcon name="check" className="text-sm" />
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  Transparent local PKR pricing with direct bank transfer &amp; card support
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white mt-0.5">
                  <MaterialIcon name="check" className="text-sm" />
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  Dedicated isolated sessions that keep your research 100% confidential
                </span>
              </div>
            </div>

            {/* Button */}
            <div className="mt-9">
              <Link
                href="/tools"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-black active:scale-[0.98]"
              >
                <span>Explore all tools</span>
                <MaterialIcon name="arrow_forward" className="text-sm" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual UI Preview */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-purple-300/40 blur-xl -z-10" />

            <div className="rounded-3xl border border-purple-200/80 bg-white p-6 sm:p-8 shadow-xl">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-neutral-300" />
                  <span className="h-3 w-3 rounded-full bg-neutral-300" />
                  <span className="h-3 w-3 rounded-full bg-neutral-300" />
                  <span className="ml-2 text-xs font-bold text-neutral-400">Extension Dispatcher</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synced
                </span>
              </div>

              {/* Extension UI Content */}
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Active Pass</span>
                    <span className="rounded-full bg-neutral-900 px-2.5 py-0.5 text-[10px] font-bold text-yellow-400">
                      7-Day Sprint
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-base font-extrabold text-neutral-900">Semrush Guru + Ahrefs</div>
                      <div className="text-xs text-neutral-500">Expires in 5 days, 14 hours</div>
                    </div>
                    <span className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-neutral-950 text-xs">
                      <MaterialIcon name="bolt" className="text-base text-neutral-950" />
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-neutral-200/80 bg-white p-3.5">
                    <div className="text-xs text-neutral-500">Session Status</div>
                    <div className="mt-1 text-sm font-extrabold text-emerald-600 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Encrypted Live
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200/80 bg-white p-3.5">
                    <div className="text-xs text-neutral-500">Latency</div>
                    <div className="mt-1 text-sm font-extrabold text-neutral-900">18 ms (Global)</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-purple-300 bg-purple-50/60 p-4 text-center">
                  <div className="text-xs font-bold text-purple-950">Quick One-Click Launch</div>
                  <p className="mt-1 text-[11px] text-purple-800">
                    Clicking launch opens your session in a private sandbox with active auth cookies automatically populated.
                  </p>
                  <Link
                    href="/dashboard"
                    className="mt-3 inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-2 text-xs font-bold text-white hover:bg-black transition-colors"
                  >
                    Open in Chrome &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

