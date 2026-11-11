import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/config";
import { mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";
import {
  isSessionServiceConfigured,
  requestToolLaunch,
} from "@/lib/session-service/client";
import { expireStaleAccessRecords } from "@/lib/access/maintenance";
import {
  createExtensionClaimToken,
  pickLaunchAccount,
} from "@/lib/auth/extension-launch";
import { getLiveSession } from "@/lib/auth/live-session";
import { normalizeToolConfig } from "@/lib/tools/extension-presets";

type RouteParams = { params: { slug: string } };
type LaunchMode = "PROXY" | "EXTENSION" | "DIRECT" | "CLOUD";

async function verifyToolAccess(userId: string, slug: string) {
  await expireStaleAccessRecords();

  if (isMockMode()) {
    const rawTool = mockStore.tools.find((t) => t.slug === slug && t.active);
    if (!rawTool) return { ok: false as const, error: "Tool not found", status: 404 };
    const tool = normalizeToolConfig(rawTool);
    if (tool.needsDbHeal) {
      rawTool.launchUrl = tool.launchUrl;
      rawTool.launchMode = tool.launchMode;
    }

    const access = mockStore.toolAccess.find(
      (a) =>
        a.userId === userId &&
        a.toolId === tool.id &&
        a.status === "ACTIVE" &&
        (!a.expiresAt || a.expiresAt > new Date())
    );
    if (!access) {
      return { ok: false as const, error: "You do not have access to this tool", status: 403 };
    }
    return { ok: true as const, tool };
  }

  const rawTool = await prisma.tool.findUnique({ where: { slug } });
  if (!rawTool || !rawTool.active) {
    return { ok: false as const, error: "Tool not found", status: 404 };
  }

  const tool = normalizeToolConfig(rawTool);
  if (tool.needsDbHeal) {
    await prisma.tool
      .update({
        where: { id: rawTool.id },
        data: {
          launchUrl: tool.launchUrl,
          launchMode: tool.launchMode,
        },
      })
      .catch(() => undefined);
  }

  const access = await prisma.userToolAccess.findUnique({
    where: { userId_toolId: { userId, toolId: tool.id } },
  });

  if (
    !access ||
    access.status !== "ACTIVE" ||
    (access.expiresAt && access.expiresAt < new Date())
  ) {
    return { ok: false as const, error: "You do not have access to this tool", status: 403 };
  }

  return { ok: true as const, tool };
}

function wantsJson(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("format") === "json") return true;
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("application/json");
}

function successResponse(launchUrl: string, asJson: boolean) {
  if (asJson) {
    return NextResponse.json({ mode: "PROXY", launchUrl });
  }
  return NextResponse.redirect(launchUrl);
}

export async function GET(request: Request, { params }: RouteParams) {
  const asJson = wantsJson(request);
  const live = await getLiveSession();
  if (!live) {
    return NextResponse.json(
      { error: "Unauthorized", code: "SESSION_INVALID" },
      { status: 401 }
    );
  }

  if (live.status === "SUSPENDED") {
    return NextResponse.json(
      { error: "Your account is suspended" },
      { status: 403 }
    );
  }

  const check = await verifyToolAccess(live.userId, params.slug);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { tool } = check;
  const rawMode: LaunchMode =
    "launchMode" in tool && tool.launchMode
      ? (tool.launchMode as LaunchMode)
      : "PROXY";
  // Retired cloud browser — treat CLOUD like EXTENSION (desktop Chrome).
  const launchMode: LaunchMode =
    rawMode === "CLOUD" ? "EXTENSION" : rawMode;

  if (!tool.launchUrl) {
    return NextResponse.json(
      { error: "This tool does not have a launch URL configured yet" },
      { status: 503 }
    );
  }

  if (launchMode === "DIRECT") {
    if (asJson) {
      return NextResponse.json({ mode: "DIRECT", launchUrl: tool.launchUrl });
    }
    return NextResponse.redirect(tool.launchUrl);
  }

  if (launchMode === "EXTENSION") {
    const account = await pickLaunchAccount(tool.id);
    if (!account) {
      return NextResponse.json(
        {
          error:
            "No active tool account with valid cookies. Admin must add cookies under Admin → Tools → Accounts.",
        },
        { status: 503 }
      );
    }

    const claim = await createExtensionClaimToken({
      userId: live.userId,
      toolId: tool.id,
      toolAccountId: account.id,
    });

    return NextResponse.json({
      mode: "EXTENSION",
      claimToken: claim.token,
      openUrl: tool.launchUrl,
      expiresAt: claim.expiresAt.toISOString(),
      installHint:
        "Install the Orbyt Rush Tool Launcher Chrome extension on desktop, then click Launch again.",
    });
  }

  if (!isSessionServiceConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "Session service is not configured. Tool launch is unavailable until SESSION_SERVICE_* env vars are set.",
        },
        { status: 503 }
      );
    }

    if (isMockMode()) {
      const hasAccount = mockStore.toolAccounts.some(
        (a) => a.toolId === tool.id && a.active
      );
      if (!hasAccount) {
        return NextResponse.json(
          {
            error:
              "No tool account configured. Admin must add cookies under Admin → Tools → Accounts.",
          },
          { status: 503 }
        );
      }
    }

    return successResponse(tool.launchUrl, asJson);
  }

  try {
    const result = await requestToolLaunch({
      userId: live.userId,
      toolSlug: params.slug,
      userEmail: live.session.user.email ?? undefined,
    });
    return successResponse(result.launchUrl, asJson);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to launch tool session";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
