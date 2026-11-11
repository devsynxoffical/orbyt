import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations/auth";
import { isMockMode } from "@/lib/config";
import { mockId, mockStore } from "@/lib/mock/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse({
      ...body,
      confirmPassword: body.password,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    if (isMockMode()) {
      const existing = mockStore.users.find((u) => u.email === normalizedEmail);
      if (existing) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }
      mockStore.users.push({
        id: mockId("user"),
        name,
        email: normalizedEmail,
        password,
        role: "USER",
        status: "ACTIVE",
        createdAt: new Date(),
      });
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: "USER",
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
