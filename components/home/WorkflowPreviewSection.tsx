"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import Link from "next/link";

export function WorkflowPreviewSection() {
  const [activeTab, setActiveTab] = useState<"all" | "seo" | "content">("all");

  return (
    <section className="bg-white py-20 sm:py-28 border-b border-neutral-200/80">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-neutral-800">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
            <span>Workflow Velocity</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950">
            A quick look inside the workflow.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600">
            Launch tools, monitor real-time session health, and manage client projects from one intuitive interface.
          </p>
        </div>

        {/* Dashboard Mockup Container - Clean Light Theme */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between border-b border-neutral-200/80 bg-neutral-50 px-6 py-3.5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-3 text-xs font-semibold text-neutral-500">
                Orbyt Rush Engine &mdash; Secure Proxy Hub
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All 28 Systems Operational
              </span>
            </div>
          </div>

          {/* Main Dashboard Interface Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            {/* Light Sidebar */}
            <div className="border-b border-neutral-200 lg:border-b-0 lg:border-r lg:col-span-3 bg-white p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 px-2 py-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400 font-black text-neutral-950 text-sm">
                    O
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-neutral-950">Orbyt Rush</div>
                    <div className="text-[10px] text-neutral-500 font-medium">Professional Workspace</div>
                  </div>
                </div>

                <div className="mt-8 space-y-1.5">
                  <div className="flex items-center gap-3 rounded-xl bg-yellow-100/70 border border-yellow-300/80 px-3.5 py-2.5 text-xs font-bold text-neutral-950">
                    <MaterialIcon name="rocket_launch" className="text-neutral-950 text-lg" />
                    <span>Launchpad</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer">
                    <MaterialIcon name="confirmation_number" className="text-neutral-400 text-lg" />
                    <span>Active Passes</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer">
                    <MaterialIcon name="monitoring" className="text-neutral-400 text-lg" />
                    <span>Analytics &amp; Usage</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer">
                    <MaterialIcon name="extension" className="text-neutral-400 text-lg" />
                    <span>Chrome Launcher</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer">
                    <MaterialIcon name="settings" className="text-neutral-400 text-lg" />
                    <span>Settings</span>
                  </div>
                </div>
              </div>

              {/* User badge */}
              <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center font-black text-neutral-950 text-xs">
                    OR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-950">Agency Member</div>
                    <div className="text-[10px] text-neutral-500">30-Day Pro Pass</div>
                  </div>
                </div>
                <MaterialIcon name="check_circle" className="text-emerald-600 text-sm" />
              </div>
            </div>

            {/* Main Stage Content */}
            <div className="lg:col-span-9 bg-[#FAF9F5] p-6 sm:p-8 flex flex-col justify-between">
              {/* Metrics cards row */}
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Total Launches</div>
                    <div className="mt-1 text-2xl font-black text-neutral-950">7,122</div>
                    <div className="mt-1 text-[11px] text-emerald-600 font-semibold">+14.2% this week</div>
                  </div>
                  <div className="rounded-2xl border border-yellow-300 bg-yellow-50/70 p-4 shadow-2xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-yellow-900">Avg Session</div>
                    <div className="mt-1 text-2xl font-black text-yellow-950">9:04 hrs</div>
                    <div className="mt-1 text-[11px] text-yellow-800 font-semibold">Continuous access</div>
                  </div>
                  <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Launch Velocity</div>
                    <div className="mt-1 text-2xl font-black text-neutral-950">1:24 s</div>
                    <div className="mt-1 text-[11px] text-emerald-600 font-semibold">Instant auto-token</div>
                  </div>
                  <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Active Orbit</div>
                    <div className="mt-1 text-2xl font-black text-neutral-950">28 Tools</div>
                    <div className="mt-1 text-[11px] text-emerald-600 font-semibold">Zero disconnects</div>
                  </div>
                </div>

                {/* Workflow interactive launcher mock */}
                <div className="mt-8 rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                    <div>
                      <h4 className="text-base font-bold text-neutral-950">Single-Click Launchboard</h4>
                      <p className="text-xs text-neutral-500">Pick any tool to launch directly in your browser with private credentials.</p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-neutral-100 p-1 border border-neutral-200">
                      <button
                        onClick={() => setActiveTab("all")}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${activeTab === "all" ? "bg-white text-neutral-950 font-bold shadow-2xs" : "text-neutral-600 hover:text-neutral-950"}`}
                      >
                        All Tools
                      </button>
                      <button
                        onClick={() => setActiveTab("seo")}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${activeTab === "seo" ? "bg-white text-neutral-950 font-bold shadow-2xs" : "text-neutral-600 hover:text-neutral-950"}`}
                      >
                        SEO
                      </button>
                      <button
                        onClick={() => setActiveTab("content")}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${activeTab === "content" ? "bg-white text-neutral-950 font-bold shadow-2xs" : "text-neutral-600 hover:text-neutral-950"}`}
                      >
                        Content
                      </button>
                    </div>
                  </div>

                  {/* Active Tool List */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3.5 hover:border-yellow-400 hover:bg-white transition-all shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white font-black text-sm">
                          SE
                        </div>
                        <div>
                          <div className="text-sm font-bold text-neutral-950">Semrush Guru</div>
                          <div className="text-xs text-neutral-500">Unlimited research &bull; Session Live</div>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        className="rounded-full bg-yellow-400 hover:bg-yellow-300 px-4 py-1.5 text-xs font-bold text-neutral-950 transition-colors shadow-2xs"
                      >
                        Launch
                      </Link>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3.5 hover:border-yellow-400 hover:bg-white transition-all shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm">
                          AH
                        </div>
                        <div>
                          <div className="text-sm font-bold text-neutral-950">Ahrefs Standard</div>
                          <div className="text-xs text-neutral-500">Site explorer &bull; Full exports</div>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        className="rounded-full bg-yellow-400 hover:bg-yellow-300 px-4 py-1.5 text-xs font-bold text-neutral-950 transition-colors shadow-2xs"
                      >
                        Launch
                      </Link>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3.5 hover:border-yellow-400 hover:bg-white transition-all shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white font-black text-sm">
                          MO
                        </div>
                        <div>
                          <div className="text-sm font-bold text-neutral-950">Moz Pro Medium</div>
                          <div className="text-xs text-neutral-500">Keyword rank tracker &bull; Link equity</div>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        className="rounded-full bg-yellow-400 hover:bg-yellow-300 px-4 py-1.5 text-xs font-bold text-neutral-950 transition-colors shadow-2xs"
                      >
                        Launch
                      </Link>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3.5 hover:border-yellow-400 hover:bg-white transition-all shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-sm">
                          SP
                        </div>
                        <div>
                          <div className="text-sm font-bold text-neutral-950">SpyFu Competitor Intel</div>
                          <div className="text-xs text-neutral-500">Google Ads history &bull; SEO keywords</div>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        className="rounded-full bg-yellow-400 hover:bg-yellow-300 px-4 py-1.5 text-xs font-bold text-neutral-950 transition-colors shadow-2xs"
                      >
                        Launch
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom bar inside preview */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-200 pt-4 text-xs text-neutral-600">
                <span className="flex items-center gap-2 font-medium">
                  <MaterialIcon name="shield" className="text-yellow-600 text-base" />
                  Isolated browser sandbox with automated session rotation
                </span>
                <Link
                  href="/tools"
                  className="font-bold text-neutral-950 hover:underline flex items-center gap-1"
                >
                  View full catalog of 28+ tools &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
