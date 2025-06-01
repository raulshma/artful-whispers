import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:5000", // Your backend URL
});

export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession, 
  getSession 
} = authClient;
