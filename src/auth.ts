import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { verifyUserCredentials } from "@/lib/store";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await verifyUserCredentials(
          parsed.data.email,
          parsed.data.password,
        );
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? user.email,
          };
        }

        const adminEmail = process.env.ATPIO_ADMIN_EMAIL;
        const adminPassword = process.env.ATPIO_ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          return null;
        }

        if (
          parsed.data.email !== adminEmail ||
          parsed.data.password !== adminPassword
        ) {
          return null;
        }

        return {
          id: "atpio-admin",
          email: parsed.data.email,
          name: "Atpio Admin",
        };
      },
    }),
  ],
});
