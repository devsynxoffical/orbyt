/* Orbyt Rush ↔ extension bridge on the dashboard origin. */
const manifest = chrome.runtime.getManifest();
const currentVersion = manifest.version || "1.5.0";

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data;
  if (!data) return;
  const isOrbyt = data.source === "orbyt-dashboard" || data.source === "rankmora-dashboard";
  if (!isOrbyt) return;

  if (data.type === "ORBYT_EXTENSION_PING" || data.type === "RANKMORA_EXTENSION_PING") {
    const payload = {
      source: "orbyt-extension",
      type: "ORBYT_EXTENSION_READY",
      version: currentVersion,
    };
    window.postMessage(payload, "*");
    window.postMessage({ ...payload, source: "rankmora-extension", type: "RANKMORA_EXTENSION_READY" }, "*");
    return;
  }

  if (data.type !== "ORBYT_EXTENSION_LAUNCH" && data.type !== "RANKMORA_EXTENSION_LAUNCH") return;

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
      const resPayload = {
        source: "orbyt-extension",
        type: "ORBYT_EXTENSION_RESULT",
        ok: !error && response?.ok,
        error: error?.message || response?.error || null,
        code: response?.code || null,
        cookiesSet: response?.cookiesSet,
        cookiesTotal: response?.cookiesTotal,
        warning: response?.warning,
      };
      window.postMessage(resPayload, "*");
      window.postMessage({ ...resPayload, source: "rankmora-extension", type: "RANKMORA_EXTENSION_RESULT" }, "*");
    }
  );
});

const readyPayload = {
  source: "orbyt-extension",
  type: "ORBYT_EXTENSION_READY",
  version: currentVersion,
};
window.postMessage(readyPayload, "*");
window.postMessage({ ...readyPayload, source: "rankmora-extension", type: "RANKMORA_EXTENSION_READY" }, "*");

document.documentElement.dataset.orbytExt = "1";
document.documentElement.dataset.orbytExtVersion = currentVersion;
document.documentElement.dataset.rankmoraExt = "1";
document.documentElement.dataset.rankmoraExtVersion = currentVersion;
