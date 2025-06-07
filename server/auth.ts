import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { 
  users, 
  sessions, 
  accounts, 
  verificationTokens 
} from "@shared/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verificationTokens,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable for development
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      timezone: {
        type: "string",
        required: false,
        defaultValue: "UTC",
      },
      isOnboarded: {
        type: "string",
        required: false,
        defaultValue: "false",
      },
      gender: {
        type: "string",
        required: false,
      },
      nationality: {
        type: "string",
        required: false,
      },
      languages: {
        type: "string",
        required: false,
      },
    },
  },
  trustedOrigins: [
    "http://localhost:5173", // Vite dev server
    "http://localhost:3000", // Alternative port
    "http://localhost:5000", // Alternative port
    "http://localhost:8081", // Expo dev server
    "http://localhost:19006", // Expo web
    "exp://", // Expo development
    "http://192.168.1.3:5000", // Local network access for mobile (corrected IP)
    "http://192.168.1.9:5000", // Alternative local network IP
    "http://192.168.1.100:5000", // Alternative local network IP
    "http://10.0.2.2:5000", // Android emulator
    "*", // Allow all origins for development (remove in production)
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
