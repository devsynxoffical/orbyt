import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/auth/password-reset";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  try {
    const result = await resetPasswordWithToken(
      parsed.data.token,
      parsed.data.password
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Password updated. You can sign in with your new password.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Could not reset password. Please try again." },
      { status: 500 }
    );
  }
}
