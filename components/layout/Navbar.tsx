import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NavbarClient } from "@/components/layout/NavbarClient";

export async function Navbar() {
  let isLoggedIn = false;
  let isAdmin = false;
  try {
    const session = await getServerSession(authOptions);
    isLoggedIn = Boolean(session);
    isAdmin = session?.user.role === "ADMIN";
  } catch (err) {
    console.error("[navbar] session lookup failed", err);
  }
  return <NavbarClient isLoggedIn={isLoggedIn} isAdmin={isAdmin} />;
}
