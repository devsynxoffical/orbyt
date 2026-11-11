"use client";

import { useState } from "react";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
  trigger: React.ReactNode;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  variant = "primary",
  onConfirm,
  trigger,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_20px_40px_-12px_rgba(70,72,212,0.15)]">
            <h3 className="text-lg font-bold text-collab-yellow">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="btn-secondary !px-4 !py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-neutral-0 disabled:opacity-60 ${
                  variant === "danger"
                    ? "bg-danger-500 hover:bg-danger-500/90"
                    : "bg-brand-primary hover:bg-primary-700"
                }`}
              >
                {loading ? "Please wait..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
