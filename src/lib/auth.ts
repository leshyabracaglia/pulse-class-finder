import { NextAuthOptions, getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { SiweMessage } from "siwe";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    // Email + password (kept for dev seeds)
    Credentials({
      id: "credentials",
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
    // Wallet-based sign-in via SIWE
    Credentials({
      id: "siwe",
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature) return null;
        try {
          const siwe = new SiweMessage(JSON.parse(credentials.message));
          const result = await siwe.verify({ signature: credentials.signature });
          if (!result.success) return null;

          const walletAddress = siwe.address.toLowerCase();
          const [profile] = await db
            .select()
            .from(profiles)
            .where(eq(profiles.wallet_address, walletAddress));

          if (profile) {
            return { id: profile.id, email: profile.email, name: profile.full_name };
          }

          // First-time wallet sign-in: create a new profile
          const id = crypto.randomUUID();
          const email = `${walletAddress}@wallet.eth`;
          await db.insert(profiles).values({ id, email, wallet_address: walletAddress });
          return { id, email, name: null };
        } catch {
          return null;
        }
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
        session.user.id = token.id as string;
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
