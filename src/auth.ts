import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/mongodb";
import bcrypt from "bcryptjs";
import NextAuth, { NextAuthOptions, Session, User } from "next-auth";

export const authConfig: NextAuthOptions = {
  session: { strategy: "jwt" },
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = await clientPromise;
        const db = client.db("offdayManagement"); // Replace with your actual DB name
        const usersCollection = db.collection("users");

        // Find user by email
        const user = await usersCollection.findOne({ email: credentials.email });
        if (!user) return null;

        // Validate password using bcrypt
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        // Return user object (required fields)
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        } as User & { role: string };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as User & { role: string }).role; // Save custom role in JWT
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
      }
      return session as Session & { user: User & { role: string } };
    },
  },
  pages: {
    signIn: "/dashboard/requests", // Custom sign-in page at this path
  },
};

const authHandler = NextAuth(authConfig);

export default authHandler;
