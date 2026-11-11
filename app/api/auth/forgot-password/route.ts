import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/auth/password-reset";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid email" },
      { status: 400 }
    );
  }

  try {
    const result = await requestPasswordReset(parsed.data.email);
    return NextResponse.json({
      success: true,
      message:
        "If an account exists for that email, we sent password reset instructions.",
      ...(result.debugResetUrl
        ? { debugResetUrl: result.debugResetUrl }
        : {}),
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    const detail =
      err instanceof Error && err.message.startsWith("Email delivery failed:")
        ? err.message
        : "Could not process password reset. Please try again later.";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
