"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  integrateCatalogTools,
  saveTool,
  deleteTool,
} from "@/lib/actions/admin";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  TOOL_CATEGORIES,
  ToolCategory,
  slugifyToolName,
} from "@/lib/tools/catalog";
import { getExtensionToolPreset } from "@/lib/tools/extension-presets";
import type { CatalogToolView } from "@/lib/data/tool-catalog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconPackage } from "@/components/ui/icons";

const toolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string(),
  iconUrl: z.string(),
  pricePkr: z.number().min(0, "Price must be zero or more"),
  accessDurationDays: z.number().min(1, "Duration must be at least 1 day"),
  launchUrl: z.string(),
  proxySubdomain: z.string(),
  launchMode: z.enum(["PROXY", "EXTENSION", "DIRECT"]),
});

type ToolFormData = z.infer<typeof toolSchema>;

type Tool = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  pricePkr: number;
  accessDurationDays: number;
  launchUrl: string | null;
  proxySubdomain?: string | null;
  launchMode?: "PROXY" | "EXTENSION" | "CLOUD" | "DIRECT";
};

type Tab = "active" | "integrate" | "custom";

type AdminToolsHubProps = {
  activeTools: Tool[];
  catalog: CatalogToolView[];
  availableCount: number;
};

const categoryColors: Record<string, string> = {
  "All-in-One": "bg-primary-50 text-primary-700",
  "Keyword Research": "bg-blue-50 text-blue-700",
  "Backlink Analysis": "bg-purple-50 text-purple-700",
  "Technical SEO": "bg-amber-50 text-amber-700",
  "Rank Tracking": "bg-teal-50 text-teal-700",
  "Content & Writing": "bg-pink-50 text-pink-700",
  "Competitor Research": "bg-orange-50 text-orange-700",
  "Local SEO": "bg-green-50 text-green-700",
  "Social & Ads": "bg-red-50 text-red-700",
};

export function AdminToolsHub({ activeTools, catalog, availableCount }: AdminToolsHubProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("active");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ToolCategory | "ALL">("ALL");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [integrating, setIntegrating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<Tool | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const available = useMemo(
    () => catalog.filter((t) => !t.integrated),
    [catalog]
  );

  const filtered = useMemo(() => {
    let list = tab === "integrate" ? available : [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.slug.includes(q)
      );
    }
    if (category !== "ALL") {
      list = list.filter((t) => t.category === category);
    }
    return list;
  }, [available, search, category, tab]);

  const filteredActive = useMemo(() => {
    if (!search) return activeTools;
    const q = search.toLowerCase();
    return activeTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false) ||
        t.slug.includes(q)
    );
  }, [activeTools, search]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ToolFormData>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      iconUrl: "",
      pricePkr: 0,
      accessDurationDays: 30,
      launchUrl: "",
      proxySubdomain: "",
      launchMode: "PROXY",
    },
  });

  const toggleSelect = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelected(new Set(filtered.map((t) => t.slug)));
  };

  const clearSelection = () => setSelected(new Set());

  const handleIntegrate = async (slugs?: string[]) => {
    const toAdd = slugs ?? Array.from(selected);
    if (toAdd.length === 0) return;
    setIntegrating(true);
    setMessage(null);
    try {
      const result = await integrateCatalogTools(toAdd);
      const parts: string[] = [];
      if (result.added.length)
        parts.push(`Added: ${result.added.join(", ")}`);
      if (result.skipped.length)
        parts.push(`Already in catalog: ${result.skipped.join(", ")}`);
      setMessage(parts.join(" · ") || "Done");
      setSelected(new Set());
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Integration failed");
    } finally {
      setIntegrating(false);
    }
  };

  const openCreateCustom = () => {
    setEditing(null);
    reset({
      name: "",
      slug: "",
      description: "",
      iconUrl: "",
      pricePkr: 0,
      accessDurationDays: 30,
      launchUrl: "",
      proxySubdomain: "",
      launchMode: "PROXY",
    });
    setShowCustomForm(true);
    setTab("custom");
  };

  const openEdit = (tool: Tool) => {
    setEditing(tool);
    const preset = getExtensionToolPreset(tool.slug);
    reset({
      name: tool.name,
      slug: tool.slug,
      description: tool.description ?? "",
      iconUrl: tool.iconUrl ?? "",
      pricePkr: tool.pricePkr,
      accessDurationDays: tool.accessDurationDays,
      launchUrl: tool.launchUrl || preset?.launchUrl || "",
      proxySubdomain: tool.proxySubdomain ?? tool.slug,
      launchMode: preset
        ? tool.launchMode === "DIRECT"
          ? "DIRECT"
          : "EXTENSION"
        : tool.launchMode === "CLOUD"
          ? "EXTENSION"
          : tool.launchMode === "DIRECT" || tool.launchMode === "EXTENSION"
            ? tool.launchMode
            : "PROXY",
    });
    setShowCustomForm(true);
    setTab("custom");
  };

  const onSubmitCustom = async (data: ToolFormData) => {
    await saveTool({ id: editing?.id, ...data });
    setShowCustomForm(false);
    setEditing(null);
    setTab("active");
    router.refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from the catalog?`)) return;
    await deleteTool(id);
    router.refresh();
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "active", label: "Your catalog", count: activeTools.length },
    { id: "integrate", label: "Optional suggestions", count: availableCount },
    { id: "custom", label: "Advanced form" },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setSearch("");
                if (t.id !== "custom") setShowCustomForm(false);
                if (t.id === "custom") setShowCustomForm(true);
              }}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-neutral-0 text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {t.label}
              {t.count != null && (
                <span className="ml-1.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
        {tab !== "custom" && (
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm sm:max-w-xs"
          />
        )}
      </div>

      {message && (
        <p className="rounded-lg bg-accent-500/10 px-4 py-3 text-sm text-accent-600">
          {message}
        </p>
      )}

      {/* Integrate tab */}
      {tab === "integrate" && (
        <>
          <div className="dashboard-panel p-4">
            <p className="text-sm text-neutral-600">
              <strong className="text-neutral-800">Optional:</strong> pre-filled
              suggestions for popular SEO tools. Use the box above to add any
              tool by name instead — you are not required to pick from this list.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory("ALL")}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  category === "ALL"
                    ? "bg-primary-500 text-neutral-0"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                All ({available.length})
              </button>
              {TOOL_CATEGORIES.map((cat) => {
                const count = available.filter((t) => t.category === cat).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      category === cat
                        ? "bg-primary-500 text-neutral-0"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {selected.size > 0 && (
            <div className="sticky top-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 shadow-sm">
              <span className="text-sm font-medium text-primary-800">
                {selected.size} tool{selected.size === 1 ? "" : "s"} selected
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-lg border border-primary-200 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100"
                >
                  Clear
                </button>
                <button
                  type="button"
                  disabled={integrating}
                  onClick={() => handleIntegrate()}
                  className="rounded-lg bg-primary-500 px-4 py-1.5 text-sm font-medium text-neutral-0 hover:bg-primary-600 disabled:opacity-60"
                >
                  {integrating ? "Adding..." : "Integrate selected"}
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-neutral-500">
              {filtered.length} tool{filtered.length === 1 ? "" : "s"} available
            </span>
            {filtered.length > 0 && (
              <button
                type="button"
                onClick={selectAllVisible}
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Select all visible
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<IconPackage className="h-6 w-6" />}
              title="No tools to add"
              description={
                available.length === 0
                  ? "All library tools are already in your catalog. Add a custom tool instead."
                  : "No tools match your search. Try a different filter."
              }
              action={
                <button
                  type="button"
                  onClick={openCreateCustom}
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-600"
                >
                  Add custom tool
                </button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((tool) => {
                const isSelected = selected.has(tool.slug);
                return (
                  <div
                    key={tool.slug}
                    className={`dashboard-panel flex flex-col p-4 transition-all ${
                      isSelected ? "ring-2 ring-primary-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleSelect(tool.slug)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            isSelected
                              ? "border-primary-500 bg-primary-500 text-neutral-0"
                              : "border-neutral-300 bg-neutral-0"
                          }`}
                        >
                          {isSelected && (
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M10.28 2.28a.75.75 0 00-1.06-1.06L4.5 5.94 2.78 4.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l5.25-5.25z" />
                            </svg>
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-neutral-900">
                              {tool.name}
                            </h3>
                            {tool.popular && (
                              <span className="rounded bg-warning-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-warning-500">
                                Popular
                              </span>
                            )}
                          </div>
                          <span
                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              categoryColors[tool.category] ??
                              "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {tool.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600">
                      {tool.description}
                    </p>
                    <button
                      type="button"
                      disabled={integrating}
                      onClick={() => handleIntegrate([tool.slug])}
                      className="mt-4 w-full rounded-lg bg-primary-500 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-600 disabled:opacity-60"
                    >
                      Add to catalog
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Active tab */}
      {tab === "active" && (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={openCreateCustom}
              className="rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50"
            >
              + Custom tool
            </button>
          </div>

          {filteredActive.length === 0 ? (
            <EmptyState
              icon={<IconPackage className="h-6 w-6" />}
              title="Catalog is empty"
              description="Integrate tools from the library or create a custom entry."
              action={
                <button
                  type="button"
                  onClick={() => setTab("integrate")}
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-600"
                >
                  Browse tool library
                </button>
              }
            />
          ) : (
            <div className="dashboard-panel overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Tool
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Slug
                    </th>
                    <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 md:table-cell">
                      Price
                    </th>
                    <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 lg:table-cell">
                      Description
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActive.map((tool) => {
                    const cat = catalog.find((c) => c.slug === tool.slug);
                    return (
                      <tr
                        key={tool.id}
                        className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900">
                              {tool.name}
                            </span>
                            <StatusBadge status="ACTIVE" label="Live" />
                          </div>
                          {cat && (
                            <span
                              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                categoryColors[cat.category] ??
                                "bg-neutral-100 text-neutral-600"
                              }`}
                            >
                              {cat.category}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-neutral-500">
                          {tool.slug}
                        </td>
                        <td className="hidden px-5 py-3.5 text-sm font-medium text-neutral-800 md:table-cell">
                          PKR {tool.pricePkr.toLocaleString()}
                          <span className="mt-0.5 block text-xs font-normal text-neutral-400">
                            {tool.accessDurationDays} days
                          </span>
                        </td>
                        <td className="hidden max-w-xs truncate px-5 py-3.5 text-neutral-600 lg:table-cell">
                          {tool.description ?? "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/admin/tools/${tool.id}/accounts`}
                            className="mr-3 text-xs font-medium text-accent-600 hover:text-accent-700"
                          >
                            Accounts
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEdit(tool)}
                            className="mr-3 text-xs font-medium text-primary-600 hover:text-primary-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(tool.id, tool.name)}
                            className="text-xs font-medium text-danger-500 hover:text-danger-500/80"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Custom tool tab */}
      {tab === "custom" && (
        <div className="max-w-lg">
          <div className="dashboard-panel mb-4 p-4">
            <p className="text-sm text-neutral-600">
              Add a tool that isn&apos;t in the library — niche SEO apps, private
              integrations, or white-labeled services.
            </p>
          </div>
          {(showCustomForm || editing) && (
            <form
              onSubmit={handleSubmit(onSubmitCustom)}
              className="dashboard-panel space-y-4 p-6"
            >
              <h3 className="font-semibold text-neutral-900">
                {editing ? `Edit ${editing.name}` : "New custom tool"}
              </h3>
              <div>
                <label className="mb-1 block text-sm font-medium">Tool name</label>
                <input
                  {...register("name")}
                  onChange={(e) => {
                    register("name").onChange(e);
                    if (!editing) {
                      const nextSlug = slugifyToolName(e.target.value);
                      setValue("slug", nextSlug);
                      const preset = getExtensionToolPreset(nextSlug);
                      if (preset) {
                        setValue("launchUrl", preset.launchUrl);
                        setValue("launchMode", "EXTENSION");
                      }
                    }
                  }}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-danger-500">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Slug</label>
                <input
                  {...register("slug")}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <p className="mt-1 text-xs text-neutral-400">
                  URL-safe ID — auto-generated from name
                </p>
                {errors.slug && (
                  <p className="mt-1 text-xs text-danger-500">
                    {errors.slug.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="What does this tool do for subscribers?"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Icon URL (optional)
                </label>
                <input
                  {...register("iconUrl")}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Price (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    {...register("pricePkr", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  {errors.pricePkr && (
                    <p className="mt-1 text-xs text-danger-500">
                      {errors.pricePkr.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Access duration (days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    {...register("accessDurationDays", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  {errors.accessDurationDays && (
                    <p className="mt-1 text-xs text-danger-500">
                      {errors.accessDurationDays.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Launch URL (optional)
                </label>
                <input
                  {...register("launchUrl")}
                  placeholder="https://www.semrush.com"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <p className="mt-1 text-xs text-neutral-400">
                  Must be HTTPS. Used as the reverse-proxy upstream when session launch is enabled.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Proxy subdomain (optional)
                </label>
                <input
                  {...register("proxySubdomain")}
                  placeholder="semrush"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <p className="mt-1 text-xs text-neutral-400">
                  Becomes{" "}
                  <code className="rounded bg-neutral-100 px-1">
                    subdomain.tools.yourdomain.com
                  </code>
                  . Defaults to the tool slug.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Launch mode
                </label>
                <select
                  {...register("launchMode")}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="PROXY">Proxy (SEO tools · works on mobile)</option>
                  <option value="EXTENSION">
                    Browser extension (Canva · desktop Chrome only)
                  </option>
                  <option value="DIRECT">Direct link (no auto-login)</option>
                </select>
                <p className="mt-1 text-xs text-neutral-400">
                  Extension tools require the Orbyt Rush Chrome launcher on desktop.
                  They do not work on phone. See deploy/LAUNCH-MODES.md.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-600 disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editing
                      ? "Save changes"
                      : "Add to catalog"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomForm(false);
                    setEditing(null);
                    setTab("active");
                  }}
                  className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          {!showCustomForm && !editing && (
            <button
              type="button"
              onClick={openCreateCustom}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-600"
            >
              Create custom tool
            </button>
          )}
        </div>
      )}
    </div>
  );
}
