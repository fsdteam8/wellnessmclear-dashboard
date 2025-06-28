import { adminAuthOptions } from "@/auth";
import NextAuth from "next-auth";

const handler = NextAuth(adminAuthOptions);
export { handler as GET, handler as POST };
