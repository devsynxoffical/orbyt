import { TOOL_CATALOG, ToolCatalogEntry } from "@/lib/tools/catalog";
import { getAllTools } from "@/lib/data/tools";

export type CatalogToolView = ToolCatalogEntry & {
  integrated: boolean;
};

export async function getToolsCatalogView(): Promise<{
  active: Awaited<ReturnType<typeof getAllTools>>;
  catalog: CatalogToolView[];
}> {
  const active = await getAllTools();
  const activeSlugs = new Set(active.map((t) => t.slug));

  const catalog = TOOL_CATALOG.map((entry) => ({
    ...entry,
    integrated: activeSlugs.has(entry.slug),
  }));

  return { active, catalog };
}

export function getCategoryCounts(catalog: CatalogToolView[]) {
  const counts: Record<string, number> = {};
  for (const tool of catalog) {
    if (tool.integrated) continue;
    counts[tool.category] = (counts[tool.category] ?? 0) + 1;
  }
  return counts;
}
