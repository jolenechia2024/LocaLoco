import { createAuthClient } from "better-auth/client";

// Backend API URL
const baseURL = 'http://localhost:3000';

// Frontend callback URL (where user returns after auth)
// Automatically use the current window location during development
export const callbackURL = typeof window !== 'undefined'
    ? `${window.location.origin}`
    : 'http://localhost:5173';

export const authClient = createAuthClient({
    baseURL: baseURL
});