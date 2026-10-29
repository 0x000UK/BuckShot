'use server'

import connectDB from "@/lib/mongodb";
import UserModel from "@/models/user.model";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { validateEmail, validateHandle } from "@/lib/utils";
import { MongooseError } from "mongoose";
import { signIn } from "@/auth";
import type { AuthData } from "@/types/profile";

export interface AuthState {
    errors?: FormErrors;
    success?: boolean;
}

export type FormErrors = {
    message?: string;
    [key: string]: string | undefined;
}

export async function handleAuth(
    state: AuthState,
    payload: { type: 'signin' | 'signup'; data: AuthData }

): Promise<AuthState> {

    const { type, data } = payload;
    const { name, email, handle ,password , identifier } = data;

    if (!password || password.trim().length < 6) {
        return { errors: { password : 'Password must be at least 6 characters.' } };
    }

    const cleanEmail = email?.trim().toLowerCase();
    const cleanHandle = handle?.trim().toLowerCase();

    try {
        await connectDB();
        // 2. SIGN-UP
        if (type === 'signup') {
            if (!name || name.trim().length < 3) {
                return { errors: { name: 'Username must be at least 3 characters.' } };
            }

            if(!cleanEmail || !validateEmail(cleanEmail)) {
                return {errors : { email : 'Valid email is required'}}
            }

            if(!cleanHandle|| !validateHandle(cleanHandle)) {
                return {errors : { handle : 'username must only contain letters , numbers or underscore'}}
            }

            const existingUser = await UserModel.findOne({
                $or: [
                    { email: cleanEmail},
                    { handle: cleanHandle}
                ]
            },{ email: 1, handle: 1}); //fetch only these properties

            if (existingUser) {
                const errors: Record<string, string> = {};
    
                if (existingUser.email === cleanEmail) {
                    errors.email = 'Email already exists.';
                }
                if (existingUser.handle === cleanHandle) {
                    errors.handle = 'Username handle is already taken.';
                }
                
                return { errors };

            }
            const hashedpass = await bcrypt.hash(password, 10);
            await UserModel.create({ 
                name : name.trim(),
                email : cleanEmail,
                handle : cleanHandle, 
                password: hashedpass 
            });
        }

        const cleanIdentifier = identifier?.trim().toLowerCase() ?? cleanEmail;

        if(!cleanIdentifier) {
            return {errors : {identifier : "Username or Email is required"}}
        }

        if (type === "signin") {
            if(!validateEmail(cleanIdentifier) && !validateHandle(cleanIdentifier)) {
                return {errors : {identifier : "Invalid Username or Email"}}
            }
        }

        // 3. SIGN-IN LOGIC (Runs for sign-in OR auto-login after signup)
        await signIn("credentials", {
            identifier : cleanIdentifier,
            password : password,
            redirect: false, // Prevents default full page crashes inside Server Actions
        });
        return { success: true, errors: {} };
    } catch (error: unknown) {
        // Handle NextAuth specific credential errors natively
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { errors: { message: error.message.split('.')[0] || 'Invalid email or password combination.' } };
                default:
                    return { errors: { message: 'Authentication failed.' } };
            }
        }
        else if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000) {
            const keyPattern = (error as { keyPattern?: Record<string, number> }).keyPattern;
            if (keyPattern?.email) {
                return { errors: { email: 'Email already exists.' } };
            }
            if (keyPattern?.handle) {
                return { errors: { handle: 'Username handle is already taken.' } };
            }
            return { errors: { message: 'An account with that email or username already exists.' } };
        }
        else if (error instanceof MongooseError) {
            console.log(error.message);
            return { errors: { message: `Failed to ${type === 'signin' ? "LogIn" : "Register"}. Please contact an admin.` } };
        }
    
        // Handle unexpected application execution crashes
        return { errors: { message: 'An internal server error occurred.' } };
    }
} 
