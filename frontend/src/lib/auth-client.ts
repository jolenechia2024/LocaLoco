import { createAuthClient } from "better-auth/react";

// Better-auth client configuration
export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  fetchOptions: {
    credentials: 'include',
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;

