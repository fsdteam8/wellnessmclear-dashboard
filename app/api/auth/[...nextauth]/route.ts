import { adminAuthOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(adminAuthOptions);
export { handler as GET, handler as POST };
