import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Authenticated download of the Orbyt Rush Tool Launcher (Chrome extension ZIP).
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const primaryZip = path.join(
    process.cwd(),
    "public/extensions/orbytrush-launcher.zip"
  );
  const fallbackZip = path.join(
    process.cwd(),
    "public/extensions/rankmora-launcher.zip"
  );

  let buffer: Buffer;
  try {
    buffer = await readFile(primaryZip);
  } catch {
    try {
      buffer = await readFile(fallbackZip);
    } catch {
      return NextResponse.json(
        {
          error:
            "Extension package is not built yet. Admin should run npm run extension:pack on the server.",
        },
        { status: 503 }
      );
    }
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition":
        'attachment; filename="orbytrush-tool-launcher.zip"',
      "Cache-Control": "private, no-cache",
    },
  });
}
