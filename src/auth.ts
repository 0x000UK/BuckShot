import connectDB from "@/lib/mongodb";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sqids } from "@/lib/sqids";

export const { auth, handlers, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                identifier: { type: "text" },
                password: { type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials.identifier || !credentials.password) {
                    throw Error("Missing credentials");
                }

                const { identifier, password } = credentials;
                const normalizedIdentifier = (identifier as string).trim().toLowerCase();

                await connectDB();

                // find if user exist
                const user = await UserModel.findOne(
                    {
                        $or: [
                            { email: normalizedIdentifier },
                            { handle: normalizedIdentifier },
                        ],
                    },
                    { password: 1, handle: 1, userId: 1, role: 1, avatar: 1, name: 1, email: 1, badges: 1 }
                ).lean();

                if (!user) {
                    throw new CredentialsSignin("User does not exist");
                }

                const passmatch = await bcrypt.compare(password.toString(), user.password);

                if (!passmatch) {
                    throw new CredentialsSignin("Incorrect Password");
                }
                const publicId = sqids.encode([user.userId, 2]);

                return {
                    id: publicId || "",
                    name: user.name || "",
                    email: user.email || "",
                    role: user.role || "user",
                    handle: user.handle || "",
                    image: user.avatar || "",
                    badges: (user.badges || []) as any,
                };
            },
        }),
    ],
    callbacks: {
        jwt: async ({ token, user, trigger, session }) => {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.role = user.role;
                token.handle = user.handle;
                token.picture = user.image;
                token.badges = (user as any).badges;
            }
            if (trigger === "update" && session) {
                if (session.user?.image !== undefined) token.picture = session.user.image;
                if (session.user?.name !== undefined) token.name = session.user.name;
                if (session.user?.handle !== undefined) token.handle = session.user.handle;
            }
            return token;
        },

        session: async ({ session, token }) => {
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.name = token.name;
                session.user.email = token.email ?? "";
                session.user.handle = token.handle as string;
                session.user.role = token.role as string;
                session.user.image = token.picture;
                session.user.badges = (token.badges as any) || [];
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    secret: process.env.AUTH_SECRET,
});
