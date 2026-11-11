"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useIsMobileBrowser } from "@/lib/browser";
import {
  MIN_EXTENSION_VERSION as REQUIRED_EXTENSION_VERSION,
  compareSemver,
} from "@/lib/tools/extension-version";

export { REQUIRED_EXTENSION_VERSION, compareSemver };

const CHROME_EXTENSIONS_URL = "chrome://extensions";

export function useRankmoraExtension() {
  const [installed, setInstalled] = useState(false);
  const [version, setVersion] = useState<string | null>(null);

  const ping = useCallback(() => {
    if (typeof document !== "undefined") {
      if (document.documentElement.dataset.rankmoraExt === "1") {
        setInstalled(true);
        const v = document.documentElement.dataset.rankmoraExtVersion;
        if (v) setVersion(v);
      }
    }
    if (typeof window !== "undefined") {
      window.postMessage(
        { source: "rankmora-dashboard", type: "RANKMORA_EXTENSION_PING" },
        "*"
      );
    }
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      const data = event.data;
      if (!data || data.source !== "rankmora-extension") return;
      if (data.type === "RANKMORA_EXTENSION_READY") {
        setInstalled(true);
        if (typeof data.version === "string" && data.version) {
          setVersion(data.version);
        } else if (
          typeof document !== "undefined" &&
          document.documentElement.dataset.rankmoraExtVersion
        ) {
          setVersion(document.documentElement.dataset.rankmoraExtVersion);
        }
      }
    };
    window.addEventListener("message", onMessage);
    ping();
    return () => window.removeEventListener("message", onMessage);
  }, [ping]);

  // Outdated if extension is detected, but missing version or version is lower than required (1.4.0)
  const isOutdated =
    installed && (!version || compareSemver(version, REQUIRED_EXTENSION_VERSION) < 0);
  const extensionReady = installed && !isOutdated;

  return {
    extensionConnected: installed,
    extensionReady,
    isOutdated,
    installedVersion: version,
    requiredVersion: REQUIRED_EXTENSION_VERSION,
    pingExtension: ping,
  };
}

type ExtensionInstallPanelProps = {
  compact?: boolean;
};

export function ExtensionInstallPanel({ compact }: ExtensionInstallPanelProps) {
  const { extensionReady, isOutdated, installedVersion, requiredVersion, pingExtension } =
    useRankmoraExtension();
  const isMobile = useIsMobileBrowser();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const storeUrl = process.env.NEXT_PUBLIC_CHROME_EXTENSION_STORE_URL?.trim();

  const download = () => {
    window.location.href = "/api/tools/extension/download";
  };

  const copyExtensionsLink = async () => {
    try {
      await navigator.clipboard.writeText(CHROME_EXTENSIONS_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const copyDashboardLink = async () => {
    try {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/dashboard/extension`
          : "https://orbytrush.com/dashboard/extension";
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  };

  if (isMobile) {
    return (
      <div className={compact ? "space-y-4" : "mx-auto max-w-2xl space-y-6"}>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-5">
          <div className="flex items-start gap-3">
            <MaterialIcon
              name="install_desktop"
              className="text-2xl text-amber-700"
            />
            <div>
              <p className="text-sm font-bold text-neutral-900">
                Desktop Chrome required
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                Phone and tablet browsers cannot install Chrome extensions. Canva,
                Grammarly, Quillbot and similar tools only auto-login on a computer.
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-panel-modern space-y-3 p-5">
          <p className="text-sm font-bold text-neutral-900">What works where</p>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-neutral-600">
            <li>
              <strong>Canva, Grammarly, Quillbot:</strong> open Orbyt Rush on{" "}
              <strong>desktop Chrome</strong>, install the Orbyt Rush launcher once,
              then use Launch tool.
            </li>
            <li>
              <strong>SEO tools</strong> (Semrush, Moz, etc.) Launch from this phone
              via proxy — no extension needed.
            </li>
            <li>
              Copy the install link below and open it on your computer to set up the
              launcher.
            </li>
          </ol>
          <button
            type="button"
            onClick={() => void copyDashboardLink()}
            className="btn-primary mt-2 flex w-full justify-center !rounded-lg !py-2.5 text-sm"
          >
            {linkCopied ? "Link copied" : "Copy install link for your computer"}
          </button>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex w-full justify-center text-sm font-bold text-collab-dark hover:underline"
        >
          ← Back to tools
        </Link>
      </div>
    );
  }

  const steps = [
    {
      n: 1,
      title: "Download the extension",
      body: "Click the button below. Chrome saves the launcher ZIP to your Downloads folder.",
      action: (
        <button
          type="button"
          onClick={download}
          className="inline-flex items-center gap-2 rounded-lg bg-collab-dark px-4 py-2.5 text-sm font-bold text-white hover:bg-neutral-800"
        >
          <MaterialIcon name="download" />
          Download for Chrome
        </button>
      ),
    },
    {
      n: 2,
      title: "Unzip the file",
      body: "Double-click the ZIP to unpack the extension folder. Keep this folder — do not delete it after install.",
    },
    {
      n: 3,
      title: "Open Chrome extensions",
      body: "Copy the link below, paste it into Chrome’s address bar, and press Enter. Turn on Developer mode (top-right).",
      action: (
        <button
          type="button"
          onClick={() => void copyExtensionsLink()}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-800 hover:bg-neutral-50"
        >
          <MaterialIcon name="content_copy" />
          {copied ? "Copied chrome://extensions" : "Copy chrome://extensions"}
        </button>
      ),
    },
    {
      n: 4,
      title: "Load unpacked",
      body: 'Click "Load unpacked", select the extracted extension folder from step 2, then pin the extension.',
    },
    {
      n: 5,
      title: "Return here and refresh",
      body: "Reload this page or click Check connection. Then Launch tool on Canva and similar tools will work.",
      action: (
        <button
          type="button"
          onClick={() => {
            pingExtension();
            window.location.reload();
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-collab-yellow px-4 py-2 text-sm font-bold text-collab-dark hover:brightness-95"
        >
          <MaterialIcon name="refresh" />
          Check connection
        </button>
      ),
    },
  ];

  return (
    <div className={compact ? "space-y-4" : "mx-auto max-w-2xl space-y-6"}>
      {isOutdated ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <MaterialIcon name="system_update" className="text-2xl text-red-600" />
            <div>
              <p className="text-sm font-bold text-red-950">
                Update Required: You have version {installedVersion || "1.2.0"} installed
              </p>
              <p className="mt-1 text-xs text-red-700">
                Version <strong>v{requiredVersion}</strong> is required to launch shared tools. Previous versions no longer work.
              </p>
              <button
                type="button"
                onClick={download}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700"
              >
                <MaterialIcon name="download" />
                Download Update (v{requiredVersion})
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`rounded-xl border px-4 py-4 ${
            extensionReady
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <div className="flex items-start gap-3">
            <MaterialIcon
              name={extensionReady ? "check_circle" : "extension"}
              className={`text-2xl ${extensionReady ? "text-emerald-600" : "text-amber-700"}`}
            />
            <div>
              <p className="text-sm font-bold text-neutral-900">
                {extensionReady
                  ? `Extension connected (v${installedVersion || requiredVersion})`
                  : "Extension not detected yet"}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                {extensionReady
                  ? "You can use Launch tool on Canva, ChatGPT, Claude, Grammarly, Quillbot, and other browser-extension tools."
                  : "One-time setup on this computer takes about a minute. Phones are not supported for these tools."}
              </p>
            </div>
          </div>
        </div>
      )}

      {storeUrl && (
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-collab-dark px-4 py-3 text-sm font-bold text-white hover:bg-neutral-800"
        >
          <MaterialIcon name="install_desktop" />
          Install from Chrome Web Store
        </a>
      )}

      {!extensionReady && (
        <ol className="space-y-4">
          {steps.map((step) => (
            <li
              key={step.n}
              className="dashboard-panel-modern flex gap-4 p-4 sm:p-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-collab-dark text-sm font-bold text-collab-yellow">
                {step.n}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-neutral-900">{step.title}</p>
                <p className="mt-1 text-sm text-neutral-600">{step.body}</p>
                {step.action && <div className="mt-3">{step.action}</div>}
              </div>
            </li>
          ))}
        </ol>
      )}

      {extensionReady && !compact && (
        <Link
          href="/dashboard"
          className="btn-primary inline-flex w-full justify-center !py-3 text-sm"
        >
          Back to tools
        </Link>
      )}

      <p className="text-center text-[11px] text-neutral-400">
        Chrome requires a manual load for extensions outside the Web Store.
        Download + Load unpacked is the standard way until Orbyt Rush is listed on
        the store.
      </p>
    </div>
  );
}
