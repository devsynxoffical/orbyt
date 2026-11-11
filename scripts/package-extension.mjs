#!/usr/bin/env node
/**
 * Copies apps/tool-launcher-extension → public/extensions/orbytrush-launcher
 * and creates public/extensions/orbytrush-launcher.zip for user download.
 * Uses archiver (Node-only) so builds do not require the `zip` CLI.
 */
import { cpSync, createWriteStream, mkdirSync, rmSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "apps/tool-launcher-extension");
const destDir = path.join(root, "public/extensions/orbytrush-launcher");
const zipPath = path.join(root, "public/extensions/orbytrush-launcher.zip");
const legacyDestDir = path.join(root, "public/extensions/rankmora-launcher");
const legacyZipPath = path.join(root, "public/extensions/rankmora-launcher.zip");

const include = [
  "manifest.json",
  "background.js",
  "content.js",
  "shield.js",
  "shield.css",
  "rules.json",
  "popup.html",
  "icons",
];

async function packageZip(targetDir, targetZip, folderName) {
  mkdirSync(path.dirname(targetDir), { recursive: true });
  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(targetDir, { recursive: true });

  for (const file of include) {
    cpSync(path.join(src, file), path.join(targetDir, file), { recursive: true });
  }

  rmSync(targetZip, { force: true });

  await new Promise((resolve, reject) => {
    const output = createWriteStream(targetZip);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(targetDir, folderName);
    archive.finalize();
  });
}

await packageZip(destDir, zipPath, "orbytrush-launcher");
await packageZip(legacyDestDir, legacyZipPath, "rankmora-launcher");

console.log(`Extension packaged: ${zipPath}`);
