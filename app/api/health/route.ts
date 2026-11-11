import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isMockMode()) {
      await prisma.$queryRaw`SELECT 1`;
    }

    return NextResponse.json({
      ok: true,
      service: "orbytrush-web",
      mockMode: isMockMode(),
    });
  } catch {
    return NextResponse.json(
      { ok: false, service: "orbytrush-web" },
      { status: 503 }
    );
  }
}
