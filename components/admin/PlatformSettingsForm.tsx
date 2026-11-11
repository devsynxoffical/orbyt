"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { savePlatformSettings } from "@/lib/actions/settings";
import type { PlatformSettingsView } from "@/lib/data/platform-settings";

const schema = z.object({
  whatsappNumber: z.string(),
  defaultAccessDays: z.number().min(1, "Must be at least 1 day"),
  paymentInstructions: z.string(),
});

type FormData = z.infer<typeof schema>;

type PlatformSettingsFormProps = {
  settings: PlatformSettingsView;
};

export function PlatformSettingsForm({ settings }: PlatformSettingsFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      whatsappNumber: settings.whatsappNumber ?? "",
      defaultAccessDays: settings.defaultAccessDays,
      paymentInstructions: settings.paymentInstructions ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setMessage(null);
    setError(null);
    try {
      await savePlatformSettings(data);
      setMessage("Settings saved.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="dashboard-panel space-y-5 p-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900">Payment settings</h3>
        <p className="mt-1 text-sm text-neutral-500">
          WhatsApp number and instructions shown to users during checkout.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">WhatsApp number</label>
        <input
          {...register("whatsappNumber")}
          placeholder="923001234567"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        <p className="mt-1 text-xs text-neutral-400">
          Country code + number, no spaces. Users can chat you after submitting payment.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Default access duration (days)
        </label>
        <input
          type="number"
          min={1}
          {...register("defaultAccessDays", { valueAsNumber: true })}
          className="w-full max-w-xs rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        <p className="mt-1 text-xs text-neutral-400">
          Used when a tool does not have its own access duration set.
        </p>
        {errors.defaultAccessDays && (
          <p className="mt-1 text-xs text-danger-500">
            {errors.defaultAccessDays.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Payment instructions
        </label>
        <textarea
          {...register("paymentInstructions")}
          rows={4}
          placeholder="Transfer exact amount and upload screenshot..."
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {message && (
        <p className="rounded-lg bg-accent-500/10 px-4 py-3 text-sm text-accent-600">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-danger-500/10 px-4 py-3 text-sm text-danger-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-600 disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
