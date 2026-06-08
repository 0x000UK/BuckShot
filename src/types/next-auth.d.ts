import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  // 1. Extend the User interface to include 'role'
  interface User extends DefaultUser {
    role?: string
  }

  // 2. Extend the Session interface so 'role' is safe to use on the frontend
  interface Session extends DefaultSession {
    user: {
      role?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  // 3. Extend the JWT interface so 'role' is safe inside callbacks
  interface JWT extends DefaultJWT {
    role?: string
  }
}

export interface AuthData {
    name? : string
    email : string
    password : string
}
