"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  deleteBankAccount,
  saveBankAccount,
} from "@/lib/actions/settings";
import type { BankAccountView } from "@/lib/data/bank-accounts";
import { StatusBadge } from "@/components/ui/StatusBadge";

const schema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountTitle: z.string().min(1, "Account title is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  iban: z.string(),
  active: z.boolean(),
  sortOrder: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

type BankAccountsPanelProps = {
  accounts: BankAccountView[];
};

export function BankAccountsPanel({ accounts }: BankAccountsPanelProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<BankAccountView | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bankName: "",
      accountTitle: "",
      accountNumber: "",
      iban: "",
      active: true,
      sortOrder: accounts.length,
    },
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      bankName: "",
      accountTitle: "",
      accountNumber: "",
      iban: "",
      active: true,
      sortOrder: accounts.length,
    });
    setShowForm(true);
  };

  const openEdit = (account: BankAccountView) => {
    setEditing(account);
    reset({
      bankName: account.bankName,
      accountTitle: account.accountTitle,
      accountNumber: account.accountNumber,
      iban: account.iban ?? "",
      active: account.active,
      sortOrder: account.sortOrder,
    });
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    setMessage(null);
    setError(null);
    try {
      await saveBankAccount({ id: editing?.id, ...data });
      setShowForm(false);
      setEditing(null);
      setMessage(editing ? "Bank account updated." : "Bank account added.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save bank account");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove bank account "${name}"?`)) return;
    setError(null);
    try {
      await deleteBankAccount(id);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete bank account");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Bank accounts</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Users choose one of these accounts when paying for a tool.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-600"
        >
          + Add bank
        </button>
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

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="dashboard-panel space-y-4 p-6"
        >
          <h4 className="font-semibold text-neutral-900">
            {editing ? "Edit bank account" : "New bank account"}
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Bank / wallet name</label>
              <input
                {...register("bankName")}
                placeholder="HBL, JazzCash, EasyPaisa..."
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              />
              {errors.bankName && (
                <p className="mt-1 text-xs text-danger-500">{errors.bankName.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Account title</label>
              <input
                {...register("accountTitle")}
                placeholder="Account holder name"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              />
              {errors.accountTitle && (
                <p className="mt-1 text-xs text-danger-500">{errors.accountTitle.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Account number</label>
              <input
                {...register("accountNumber")}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              />
              {errors.accountNumber && (
                <p className="mt-1 text-xs text-danger-500">{errors.accountNumber.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">IBAN (optional)</label>
              <input
                {...register("iban")}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Display order</label>
              <input
                type="number"
                min={0}
                {...register("sortOrder", { valueAsNumber: true })}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("active")} className="rounded" />
                Active (visible to users)
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-600 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {accounts.length === 0 ? (
        <div className="dashboard-panel p-6 text-sm text-neutral-500">
          No bank accounts yet. Add at least one so users can pay.
        </div>
      ) : (
        <div className="dashboard-panel divide-y divide-neutral-50">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-neutral-900">{account.bankName}</p>
                  <StatusBadge
                    status={account.active ? "ACTIVE" : "SUSPENDED"}
                    label={account.active ? "Active" : "Hidden"}
                  />
                </div>
                <p className="text-sm text-neutral-600">{account.accountTitle}</p>
                <p className="font-mono text-sm text-neutral-500">
                  {account.accountNumber}
                  {account.iban ? ` · IBAN ${account.iban}` : ""}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(account)}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(account.id, account.bankName)}
                  className="text-sm font-medium text-danger-500 hover:text-danger-500/80"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
