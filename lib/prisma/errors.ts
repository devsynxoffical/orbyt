/** True when Prisma failed because a table/column from a pending migration is missing. */
export function isPrismaSchemaDriftError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  if (e.code === "P2021" || e.code === "P2022") return true;
  const msg = e.message ?? "";
  return (
    msg.includes("does not exist") ||
    msg.includes("SupportThread") ||
    msg.includes("SupportMessage") ||
    msg.includes("launchMode")
  );
}
