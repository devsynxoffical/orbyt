import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Check = { name: string; ok: boolean; detail?: string };

/** Admin-only schema sanity check (run after deploy). */
export async function GET() {
  if (isMockMode()) {
    return NextResponse.json({ ok: true, mockMode: true, checks: [] });
  }

  const checks: Check[] = [];

  async function tableExists(table: string) {
    try {
      const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = ${table}
        ) AS exists
      `;
      return Boolean(rows[0]?.exists);
    } catch {
      return false;
    }
  }

  async function columnExists(table: string, column: string) {
    try {
      const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = ${table}
            AND column_name = ${column}
        ) AS exists
      `;
      return Boolean(rows[0]?.exists);
    } catch {
      return false;
    }
  }

  const supportOk = await tableExists("SupportThread");
  checks.push({
    name: "SupportThread table",
    ok: supportOk,
    detail: supportOk ? undefined : "Run: npx prisma migrate deploy",
  });

  const launchModeOk = await columnExists("Tool", "launchMode");
  checks.push({
    name: "Tool.launchMode column",
    ok: launchModeOk,
    detail: launchModeOk ? undefined : "Run: npx prisma migrate deploy",
  });

  const proxyOk = await tableExists("ProxySession");
  checks.push({
    name: "ProxySession table",
    ok: proxyOk,
    detail: proxyOk ? undefined : "Run: npx prisma migrate deploy",
  });

  const sessionVerOk = await columnExists("User", "sessionVersion");
  checks.push({
    name: "User.sessionVersion column",
    ok: sessionVerOk,
    detail: sessionVerOk ? undefined : "Run: npx prisma migrate deploy",
  });

  const loginEventOk = await tableExists("LoginEvent");
  checks.push({
    name: "LoginEvent table",
    ok: loginEventOk,
    detail: loginEventOk ? undefined : "Run: npx prisma migrate deploy",
  });

  const ok = checks.every((c) => c.ok);

  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
