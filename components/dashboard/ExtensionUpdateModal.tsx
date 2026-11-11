"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type ExtensionUpdateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  installedVersion?: string | null;
  requiredVersion: string;
  onPing: () => void;
};

export function ExtensionUpdateModal({
  isOpen,
  onClose,
  installedVersion,
  requiredVersion,
  onPing,
}: ExtensionUpdateModalProps) {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  if (!isOpen) return null;

  const copyChromeExtensions = async () => {
    try {
      await navigator.clipboard.writeText("chrome://extensions");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCheckAgain = () => {
    setChecking(true);
    onPing();
    setTimeout(() => {
      setChecking(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          aria-label="Close"
        >
          <MaterialIcon name="close" className="text-xl" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <MaterialIcon name="system_update" className="text-2xl" />
          </div>
          <div>
            <span className="inline-flex rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
              Update Required
            </span>
            <h3 className="mt-1 text-lg font-extrabold text-neutral-900">
              Extension Update Required (v{requiredVersion})
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              You currently have version{" "}
              <span className="font-semibold text-neutral-800">
                v{installedVersion || "1.2.0"}
              </span>{" "}
              installed. Previous versions no longer work with shared tools. Please update to version{" "}
              <span className="font-bold text-emerald-700">v{requiredVersion}</span> to launch tools.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            How to update in 15 seconds
          </p>
          <ol className="mt-2.5 space-y-2 text-sm text-neutral-700">
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-800">
                1
              </span>
              <span>Download the new extension ZIP package below.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-800">
                2
              </span>
              <span>Unzip the file to replace your existing extension folder.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-800">
                3
              </span>
              <span>
                Go to{" "}
                <button
                  type="button"
                  onClick={copyChromeExtensions}
                  className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-blue-600 underline hover:text-blue-800"
                >
                  chrome://extensions
                  <MaterialIcon name={copied ? "check" : "content_copy"} className="text-xs" />
                </button>{" "}
                {copied && (
                  <span className="text-xs font-semibold text-emerald-600">
                    (copied!)
                  </span>
                )}{" "}
                and click the reload icon on Orbyt Rush Tool Launcher.
              </span>
            </li>
          </ol>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="/api/tools/extension/download"
            download="rankmora-tool-launcher.zip"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-collab-dark px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-800"
          >
            <MaterialIcon name="download" />
            Download Update (v{requiredVersion})
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCheckAgain}
              disabled={checking}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
            >
              <MaterialIcon
                name="refresh"
                className={`text-base ${checking ? "animate-spin" : ""}`}
              />
              {checking ? "Checking..." : "I've Updated"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-500 hover:text-neutral-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

