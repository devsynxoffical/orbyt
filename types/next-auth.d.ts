import { DefaultSession } from "next-auth";
import { Role, UserStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    error?: string;
    user: {
      id: string;
      role: Role;
      status: UserStatus;
      sessionVersion?: number;
      loginIp?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    status: UserStatus;
    sessionVersion?: number;
    loginIp?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    status: UserStatus;
    sessionVersion?: number;
    loginIp?: string;
    sessionCheckedAt?: number;
    error?: string;
  }
}
