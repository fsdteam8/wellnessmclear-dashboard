
// lib/auth/adminAuthOptions.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

export const adminAuthOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          const data = await res.json();

          console.log(data)

          if (!res.ok || !data.data?.accessToken || !data?.data.user) {
            throw new Error(data?.message || "Invalid credentials");
          }

          return {
            id: data.data.user._id,
            firstName: data.data.user.firstName,
            lastName: data.data.user.lastName,
            email: data.data.user.email,
            role: data.data.user.role,
            accessToken: data.data.accessToken,
          };
        } catch (error) {
          console.error("Admin login error:", error);
          throw new Error("Failed to log in as admin. Please try again.");
        }
      },
    }),
  ],
  /* eslint-disable @typescript-eslint/no-explicit-any */
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      session.user = {
        id: token.id,
        email: token.email,
        firstName: token.firstName,
        lastName: token.lastName,
        role: token.role,
      };
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
