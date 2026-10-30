import Sqids from "sqids";

const secret = process.env.SQID_SECRET;

if (typeof window === "undefined" && !secret &&process.env.NODE_ENV === "production") {
    console.warn("WARNING: SQID_SECRET environment variable is missing in production.");
}

export const sqids = new Sqids({
    alphabet: secret || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    minLength: 6,
});
