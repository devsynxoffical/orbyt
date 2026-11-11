#!/usr/bin/env node
/**
 * Downloads a Google-hosted Material Symbols woff2 subset for icons in lib/material-symbols-icons.ts
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "lib/material-symbols-icons.ts");
const outDir = path.join(root, "public/fonts");
const outFile = path.join(outDir, "material-symbols-outlined.woff2");

const manifest = readFileSync(manifestPath, "utf8");
const block = manifest.match(/MATERIAL_SYMBOL_NAMES\s*=\s*\[([\s\S]*?)\]\s*as const/);
if (!block) throw new Error("Could not parse MATERIAL_SYMBOL_NAMES from manifest");

const names = [...block[1].matchAll(/"([a-z0-9_]+)"/g)].map((m) => m[1]);
if (names.length === 0) throw new Error("No icon names found");

const iconNames = [...new Set(names)].sort().join(",");
const cssUrl = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=${encodeURIComponent(iconNames)}`;

try {
  const css = await fetch(cssUrl, {
    signal: AbortSignal.timeout(5000),
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    },
  }).then((r) => {
    if (!r.ok) throw new Error(`Google Fonts CSS failed: ${r.status}`);
    return r.text();
  });

  const urlMatch = css.match(/src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
  const fontUrl = urlMatch?.[1];
  if (!fontUrl) {
    throw new Error("Could not find font URL in Google Fonts CSS");
  }

  const font = await fetch(fontUrl, { signal: AbortSignal.timeout(5000) }).then((r) => {
    if (!r.ok) throw new Error(`Font download failed: ${r.status}`);
    return r.arrayBuffer();
  });

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, Buffer.from(font));
  console.log(
    `Wrote ${outFile} (${font.byteLength} bytes, ${names.length} icons)`
  );
} catch (err) {
  if (existsSync(outFile)) {
    console.log(`Using cached ${outFile} (${names.length} icons)`);
  } else {
    throw err;
  }
}
