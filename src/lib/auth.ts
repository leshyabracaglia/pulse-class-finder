import { NextAuthOptions, getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [profile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.email, credentials.email as string));

        if (!profile || !profile.password_hash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          profile.password_hash
        );
        if (!valid) return null;

        return {
          id: profile.id,
          email: profile.email,
          name: profile.full_name,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
};

export function auth() {
  return getServerSession(authOptions);
}
