import { type DefaultSession, type DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"
import type { Badge } from "./profile"

declare module "next-auth" {
    // 1. Extend the User interface to include 'role' and 'badges'
    interface User extends DefaultUser {
        role?: string
        handle?: string
        badges?: Badge[]
    }

    // 2. Extend the Session interface so 'role' and 'badges' are safe to use on the frontend
    interface Session extends DefaultSession {
        user: {
            role?: string
            handle?: string
            badges?: Badge[]
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    // 3. Extend the JWT interface so 'role' and 'badges' are safe inside callbacks
    interface JWT extends DefaultJWT {
        role?: string
        handle?: string
        badges?: Badge[]
    }
}
