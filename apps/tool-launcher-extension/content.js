/* Rankmora ↔ extension bridge on the dashboard origin. */
const manifest = chrome.runtime.getManifest();
const currentVersion = manifest.version || "1.4.1";

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data;
  if (!data || data.source !== "rankmora-dashboard") return;

  if (data.type === "RANKMORA_EXTENSION_PING") {
    window.postMessage(
      {
        source: "rankmora-extension",
        type: "RANKMORA_EXTENSION_READY",
        version: currentVersion,
      },
      "*"
    );
    return;
  }

  if (data.type !== "RANKMORA_EXTENSION_LAUNCH") return;

  chrome.runtime.sendMessage(
    {
      type: "LAUNCH",
      claimToken: data.claimToken,
      claimUrl: data.claimUrl,
      openUrl: data.openUrl,
      version: currentVersion,
    },
    (response) => {
      const error = chrome.runtime.lastError;
      window.postMessage(
        {
          source: "rankmora-extension",
          type: "RANKMORA_EXTENSION_RESULT",
          ok: !error && response?.ok,
          error: error?.message || response?.error || null,
          code: response?.code || null,
          cookiesSet: response?.cookiesSet,
          cookiesTotal: response?.cookiesTotal,
          warning: response?.warning,
        },
        "*"
      );
    }
  );
});

window.postMessage(
  {
    source: "rankmora-extension",
    type: "RANKMORA_EXTENSION_READY",
    version: currentVersion,
  },
  "*"
);
document.documentElement.dataset.rankmoraExt = "1";
document.documentElement.dataset.rankmoraExtVersion = currentVersion;
