"use client";

import Link from "next/link";
import { useRankmoraExtension } from "@/components/dashboard/ExtensionInstallPanel";
import { useIsMobileBrowser } from "@/lib/browser";

export function ExtensionSetupBanner() {
  const { extensionReady, isOutdated, installedVersion, requiredVersion } =
    useRankmoraExtension();
  const isMobile = useIsMobileBrowser();

  if (extensionReady) return null;

  if (isOutdated) {
    return (
      <div className="dashboard-panel-modern mb-6 border-red-200 bg-gradient-to-r from-red-50 to-amber-50 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                Update Required
              </span>
              <p className="text-sm font-bold text-neutral-900">
                Extension update required (v{requiredVersion})
              </p>
            </div>
            <p className="mt-1 text-xs text-neutral-600">
              You currently have version{" "}
              <span className="font-semibold text-neutral-800">
                v{installedVersion || "1.2.0"}
              </span>{" "}
              installed. Previous versions no longer work with shared tools. Please update to version{" "}
              <strong>v{requiredVersion}</strong> to continue.
            </p>
          </div>
          <Link
            href="/dashboard/extension"
            className="btn-primary shrink-0 text-center !px-5 !py-2.5 text-sm !bg-red-600 hover:!bg-red-700 font-bold text-white rounded-lg"
          >
            Update now
          </Link>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="dashboard-panel-modern mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-collab-yellow/20 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-neutral-900">
              Canva works on desktop Chrome
            </p>
            <p className="mt-0.5 text-xs text-neutral-600">
              Canva and similar tools need the Orbyt Rush Chrome extension on a
              computer. SEO tools (Semrush, Moz, etc.) still Launch from this
              phone via proxy.
            </p>
          </div>
          <Link
            href="/dashboard/extension"
            className="btn-primary shrink-0 text-center !px-5 !py-2.5 text-sm"
          >
            Desktop setup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-panel-modern mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-collab-yellow/20 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-neutral-900">
            Install the Orbyt Rush launcher (one-time)
          </p>
          <p className="mt-0.5 text-xs text-neutral-600">
            Required for Canva and other extension-based tools on desktop.
            Download ZIP → load in Chrome → launch from your dashboard.
          </p>
        </div>
        <Link
          href="/dashboard/extension"
          className="btn-primary shrink-0 text-center !px-5 !py-2.5 text-sm"
        >
          Download &amp; install
        </Link>
      </div>
    </div>
  );
}
