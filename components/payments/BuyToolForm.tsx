"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitPaymentOrder } from "@/lib/actions/payments";
import { StripeCheckoutButton } from "@/components/payments/StripeCheckoutButton";
import { ToolLogo } from "@/components/ui/ToolLogo";
import { isStripeEnabled } from "@/lib/config/site";
import {
  buildPaymentWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";
import type { BankAccountView } from "@/lib/data/bank-accounts";
import type { PlatformSettingsView } from "@/lib/data/platform-settings";

type BuyToolFormProps = {
  tool: {
    id: string;
    name: string;
    slug: string;
    pricePkr: number;
    accessDurationDays: number;
    description: string | null;
  };
  banks: BankAccountView[];
  settings: PlatformSettingsView;
  userName: string;
};

export function BuyToolForm({
  tool,
  banks,
  settings,
  userName,
}: BuyToolFormProps) {
  const router = useRouter();
  const [bankAccountId, setBankAccountId] = useState(banks[0]?.id ?? "");
  const [userNote, setUserNote] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  const selectedBank = banks.find((b) => b.id === bankAccountId);

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads/payment-screenshot", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setScreenshotUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccountId) {
      setError("Please select a bank account");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitPaymentOrder({
        toolId: tool.id,
        bankAccountId,
        screenshotUrl: screenshotUrl ?? undefined,
        userNote,
      });
      setSuccessOrderId(result.orderId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (banks.length === 0) {
    return (
      <div className="dashboard-panel p-6 text-sm text-neutral-600">
        Payments are not available yet. The administrator has not added any bank
        accounts. Please check back later or contact support.
      </div>
    );
  }

  if (successOrderId) {
    const whatsappUrl =
      settings.whatsappNumber &&
      buildWhatsAppUrl(
        settings.whatsappNumber,
        buildPaymentWhatsAppMessage({
          userName,
          toolName: tool.name,
          amountPkr: tool.pricePkr,
          bankName: selectedBank?.bankName ?? "",
          orderId: successOrderId,
        })
      );

    return (
      <div className="dashboard-panel space-y-4 p-6">
        <h3 className="text-lg font-semibold text-neutral-900">Payment submitted</h3>
        <p className="text-sm text-neutral-600">
          Your payment for <strong>{tool.name}</strong> is pending review. An admin
          will verify your transfer and grant access once approved.
        </p>
        <p className="text-xs text-neutral-400">Order ID: {successOrderId}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/orders" className="btn-secondary !px-4 !py-2">
            View my orders
          </Link>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !px-4 !py-2"
            >
              Chat on WhatsApp
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="dashboard-panel p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500">You are buying</p>
            <ToolLogo
              name={tool.name}
              slug={tool.slug}
              size="lg"
              nameClassName="text-2xl font-bold text-neutral-900"
            />
            {tool.description && (
              <p className="mt-2 max-w-xl text-sm text-neutral-600">{tool.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary-700">
              PKR {tool.pricePkr.toLocaleString()}
            </p>
            <p className="text-sm text-neutral-500">
              {tool.accessDurationDays} days access
            </p>
          </div>
        </div>
      </div>

      {isStripeEnabled() && (
        <div className="dashboard-panel space-y-4 p-6">
          <h3 className="text-sm font-semibold text-neutral-900">Pay with card</h3>
          <p className="text-sm text-neutral-600">
            Secure checkout powered by Stripe. Access is granted automatically after
            payment.
          </p>
          <StripeCheckoutButton toolId={tool.id} />
        </div>
      )}

      {isStripeEnabled() && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-50 px-3 text-neutral-400">or pay by bank transfer</span>
          </div>
        </div>
      )}

      {settings.paymentInstructions && (
        <div className="dashboard-panel p-5">
          <h3 className="text-sm font-semibold text-neutral-900">How to pay</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-600">
            {settings.paymentInstructions}
          </p>
        </div>
      )}

      <div className="dashboard-panel space-y-4 p-6">
        <h3 className="text-sm font-semibold text-neutral-900">Select bank account</h3>
        <div className="space-y-3">
          {banks.map((bank) => (
            <label
              key={bank.id}
              className={`flex cursor-pointer flex-col rounded-xl border p-4 transition-colors ${
                bankAccountId === bank.id
                  ? "border-primary-300 bg-primary-50/50"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="bank"
                  value={bank.id}
                  checked={bankAccountId === bank.id}
                  onChange={() => setBankAccountId(bank.id)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-neutral-900">{bank.bankName}</p>
                  <p className="text-sm text-neutral-600">{bank.accountTitle}</p>
                  <p className="font-mono text-sm text-neutral-700">{bank.accountNumber}</p>
                  {bank.iban && (
                    <p className="font-mono text-xs text-neutral-500">IBAN: {bank.iban}</p>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="dashboard-panel space-y-4 p-6">
        <h3 className="text-sm font-semibold text-neutral-900">Payment proof</h3>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Upload screenshot (recommended)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-neutral-600"
          />
          {uploading && (
            <p className="mt-2 text-sm text-neutral-500">Uploading...</p>
          )}
          {screenshotUrl && (
            <img
              src={screenshotUrl}
              alt="Payment screenshot preview"
              className="mt-3 h-40 rounded-lg border border-neutral-200 object-cover"
            />
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Note (optional)</label>
          <textarea
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            rows={3}
            placeholder="Transaction ID, sender name, or other details..."
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-danger-500/10 px-4 py-3 text-sm text-danger-500">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit payment for review"}
        </button>
        <Link href="/pricing" className="btn-secondary">
          Back to pricing
        </Link>
      </div>
    </form>
  );
}
