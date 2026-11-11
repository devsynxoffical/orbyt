"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { savePlan } from "@/lib/actions/admin";

const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  pricePkr: z.number().min(0, "Price must be positive"),
  durationDays: z.number().min(1, "Duration must be at least 1 day"),
  active: z.boolean(),
  toolIds: z.array(z.string()),
});

type PlanFormData = z.infer<typeof planSchema>;

type Tool = { id: string; name: string };

type PlanEditorFormProps = {
  plan?: {
    id: string;
    name: string;
    description: string | null;
    pricePkr: number;
    durationDays: number;
    active: boolean;
    tools: { tool: { id: string } }[];
  };
  allTools: Tool[];
};

export function PlanEditorForm({ plan, allTools }: PlanEditorFormProps) {
  const router = useRouter();
  const isEdit = !!plan;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: plan?.name ?? "",
      description: plan?.description ?? "",
      pricePkr: plan?.pricePkr ?? 0,
      durationDays: plan?.durationDays ?? 30,
      active: plan?.active ?? true,
      toolIds: plan?.tools.map((t) => t.tool.id) ?? [],
    },
  });

  const selectedToolIds = watch("toolIds");

  const toggleTool = (toolId: string) => {
    const current = selectedToolIds ?? [];
    if (current.includes(toolId)) {
      setValue(
        "toolIds",
        current.filter((id) => id !== toolId)
      );
    } else {
      setValue("toolIds", [...current, toolId]);
    }
  };

  const onSubmit = async (data: PlanFormData) => {
    await savePlan({
      id: plan?.id,
      name: data.name,
      description: data.description,
      pricePkr: data.pricePkr,
      durationDays: data.durationDays,
      active: data.active,
      toolIds: data.toolIds,
    });
    router.push("/admin/plans");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="dashboard-panel p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Plan name</label>
          <input className="input-field" {...register("name")} />
          {errors.name && (
            <p className="mt-1 text-xs text-danger-500">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Price (PKR)</label>
          <input
            type="number"
            className="input-field"
            {...register("pricePkr", { valueAsNumber: true })}
          />
          {errors.pricePkr && (
            <p className="mt-1 text-xs text-danger-500">
              {errors.pricePkr.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Duration (days)</label>
          <input
            type="number"
            className="input-field"
            {...register("durationDays", { valueAsNumber: true })}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("active")} />
            Active on pricing page
          </label>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          rows={3}
          className="input-field"
          {...register("description")}
        />
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-collab-yellow">Tools included</p>
        <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
          {allTools.map((tool) => (
            <label
              key={tool.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              <input
                type="checkbox"
                checked={selectedToolIds?.includes(tool.id)}
                onChange={() => toggleTool(tool.id)}
              />
              {tool.name}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : isEdit ? "Update plan" : "Create plan"}
        </button>
      </div>
    </form>
  );
}
