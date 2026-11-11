import Link from "next/link";
import { HeroSearch } from "@/components/home/HeroSearch";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-grid-yellow pt-10 pb-20 sm:pt-14 sm:pb-28 border-b border-yellow-300/60">
      {/* Decorative radial glows */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-[34rem] w-[34rem] rounded-full bg-yellow-200/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-amber-300/40 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* Left Column: Copy & Actions */}
          <div className="text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-900/10 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-800 shadow-sm backdrop-blur-sm mb-6">
              <span className="flex h-2 w-2 rounded-full bg-neutral-900 animate-pulse" />
              <span>All-In-One Workflow &amp; SEO Orbit</span>
            </div>

            {/* Massive Bold Headline matching reference */}
            <h1 className="text-balance text-4xl sm:text-6xl lg:text-[4rem] xl:text-[4.4rem] font-extrabold leading-[1.05] tracking-tight text-neutral-950">
              Less busywork. <br className="hidden sm:inline" />
              <span className="text-neutral-900">More possibilities.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-neutral-800 font-medium lg:mx-0 mx-auto">
              Instant access to industry-leading SEO, outreach, and research tools in one unified launchpad. Pay only for the days you need, launch with 1-click.
            </p>

            {/* Search Bar */}
            <div className="mt-8 max-w-lg mx-auto lg:mx-0">
              <HeroSearch />
            </div>

            {/* Action Buttons matching reference */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-black active:scale-[0.98]"
              >
                Start free trial
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-900/20 bg-white/80 px-6 py-3.5 text-sm font-semibold text-neutral-900 shadow-sm transition-all duration-200 hover:bg-white active:scale-[0.98]"
              >
                <MaterialIcon name="play_circle" className="text-lg text-neutral-900" />
                <span>Explore all tools</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs font-semibold text-neutral-700">
              <span className="inline-flex items-center gap-1.5">
                <MaterialIcon name="bolt" className="text-neutral-900 text-sm" />
                Instant 1-Click Launch
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MaterialIcon name="lock" className="text-neutral-900 text-sm" />
                Private &amp; Secure Sessions
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MaterialIcon name="payments" className="text-neutral-900 text-sm" />
                Pay in PKR or Card
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual with UI card and 3D Orbit Motif */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            {/* 3D Orbit Sphere Graphic Element */}
            <div className="relative mx-auto w-full max-w-md">
              {/* Backing decorative glow */}
              <div className="absolute -inset-4 rounded-3xl bg-white/40 blur-2xl -z-10" />

              {/* Main UI preview card */}
              <div className="relative rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                {/* Header of UI Card */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-3 w-3 rounded-full bg-rose-400" />
                    <div className="flex h-3 w-3 rounded-full bg-amber-400" />
                    <div className="flex h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs font-bold text-neutral-400">orbytrush.app</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Orbit
                  </span>
                </div>

                {/* Dashboard Stats Row */}
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-neutral-50 p-3 text-center border border-neutral-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Tools</div>
                    <div className="mt-1 text-lg font-extrabold text-neutral-900">28+ Active</div>
                  </div>
                  <div className="rounded-2xl bg-yellow-50 p-3 text-center border border-yellow-200/60">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-yellow-800">Launch</div>
                    <div className="mt-1 text-lg font-extrabold text-neutral-900">1.2s avg</div>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-3 text-center border border-neutral-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Passes</div>
                    <div className="mt-1 text-lg font-extrabold text-neutral-900">Flexible</div>
                  </div>
                </div>

                {/* Tool launch items preview */}
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white p-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 font-bold text-white text-xs">
                        SE
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900">Semrush Guru Suite</div>
                        <div className="text-[11px] text-neutral-500">Keyword research &amp; backlink audit</div>
                      </div>
                    </div>
                    <span className="rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-bold text-white">
                      Launch
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white p-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-xs">
                        AH
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900">Ahrefs Standard</div>
                        <div className="text-[11px] text-neutral-500">Site explorer &amp; SERP tracker</div>
                      </div>
                    </div>
                    <span className="rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-bold text-white">
                      Launch
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white p-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 font-bold text-white text-xs">
                        MO
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900">Moz Pro Medium</div>
                        <div className="text-[11px] text-neutral-500">Domain authority &amp; link metrics</div>
                      </div>
                    </div>
                    <span className="rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-bold text-white">
                      Launch
                    </span>
                  </div>
                </div>

                {/* Bottom notification tag */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-900 px-4 py-2.5 text-xs text-white">
                  <span className="flex items-center gap-2 font-medium">
                    <MaterialIcon name="verified_user" className="text-yellow-400 text-sm" />
                    Zero cookie hassle with Orbyt Launcher
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">Ready</span>
                </div>
              </div>

              {/* Floating 3D Planetary Orbit Graphic (matches Orbyt Rush logo!) */}
              <div className="absolute -top-6 -right-6 hidden sm:flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-yellow-100 p-2 shadow-xl ring-4 ring-white animate-float">
                <div className="relative flex h-full w-full items-center justify-center">
                  {/* Orbit ring */}
                  <div className="absolute h-20 w-20 rounded-full border-2 border-neutral-900/70 -rotate-45" />
                  <div className="text-2xl font-black text-neutral-950">O</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
