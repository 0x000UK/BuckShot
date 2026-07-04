import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const BRAND = "#7a6b4f";
export const BRAND_LIGHT = "#a8946d";
export const BRAND_GOLD = "#d9c28a";
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function validateEmail(email: string): boolean {
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
	return emailRegex.test(email)
}

export function uid(length = 12) {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return Array.from(arr, (byte) => alphabet[byte % alphabet.length]).join('');
}

export function mongoId(): string {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
    const randomHex = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => 
        Math.floor(Math.random() * 16).toString(16)
    );
    return timestamp + randomHex;
}

/**
    Simulates an API delay
    @param delay time in ms
    @param [fail=false] whether to sim failed api or not
*/
export function simAPI(delay : number , fail : boolean = false) {
    console.log('simulating...')
    return new Promise((resolve , reject) => {
        setTimeout(()=>{
            if(fail) reject("Failed API sim")
            else resolve("API data")
        }, delay)
    })
}