#!/usr/bin/env node
/**
 * Copies apps/tool-launcher-extension → public/extensions/rankmora-launcher
 * and creates public/extensions/rankmora-launcher.zip for user download.
 * Uses archiver (Node-only) so VPS builds do not require the `zip` CLI.
 */
import { cpSync, createWriteStream, mkdirSync, rmSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "apps/tool-launcher-extension");
const destDir = path.join(root, "public/extensions/rankmora-launcher");
const zipPath = path.join(root, "public/extensions/rankmora-launcher.zip");

const include = [
  "manifest.json",
  "background.js",
  "content.js",
  "shield.js",
  "shield.css",
  "rules.json",
  "popup.html",
];

mkdirSync(path.dirname(destDir), { recursive: true });
rmSync(destDir, { recursive: true, force: true });
mkdirSync(destDir, { recursive: true });

for (const file of include) {
  cpSync(path.join(src, file), path.join(destDir, file));
}

rmSync(zipPath, { force: true });

await new Promise((resolve, reject) => {
  const output = createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", resolve);
  output.on("error", reject);
  archive.on("error", reject);

  archive.pipe(output);
  archive.directory(destDir, "rankmora-launcher");
  archive.finalize();
});

console.log(`Extension packaged: ${zipPath}`);
