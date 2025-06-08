import { Platform } from "react-native";

// Network interface detection for different platforms
export const getLocalNetworkIP = async (): Promise<string> => {
  if (!__DEV__) return "https://your-production-url.com";

  try {
    // For Android emulator, always use the special localhost mapping
    if (Platform.OS === "android") {
      // Try to detect if we're on emulator vs physical device
      const isEmulator = await isAndroidEmulator();
      if (isEmulator) {
        return "http://10.0.2.2:5000";
      }
    }

    // For physical devices and iOS simulator, we need the actual local IP
    // We'll try to get it from the network interfaces
    const localIP = await detectLocalIP();
    if (localIP) {
      return `http://${localIP}:5000`;
    }

    // Fallback to environment variable or default
    const fallbackIP = process.env.EXPO_PUBLIC_LOCAL_IP || "192.168.1.9";
    return `http://${fallbackIP}:5000`;
  } catch (error) {
    console.warn("Failed to detect local IP, using fallback:", error);
    const fallbackIP = process.env.EXPO_PUBLIC_LOCAL_IP || "192.168.1.9";
    return `http://${fallbackIP}:5000`;
  }
};

// Detect if running on Android emulator
const isAndroidEmulator = async (): Promise<boolean> => {
  if (Platform.OS !== "android") return false;

  try {
    // Check various indicators that suggest emulator
    const { DeviceInfo } = require("react-native-device-info");
    if (DeviceInfo) {
      const isEmulator = await DeviceInfo.isEmulator();
      return isEmulator;
    }
  } catch (error) {
    // Fallback method - check common emulator characteristics
    console.log("DeviceInfo not available, using fallback emulator detection");
  }

  // Simple fallback - if we can't determine, assume physical device for safety
  return false;
};

// Attempt to detect local IP address
const detectLocalIP = async (): Promise<string | null> => {
  try {
    // Method 1: Try to get IP from a simple HTTP request to a known service
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch("https://api.ipify.org?format=json", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();

    // This gives us the public IP, but we need local IP
    // This is a simplified approach - in practice, you'd want to use native modules
    console.log("Public IP detected:", data.ip);

    // For now, we'll return null to use the fallback
    return null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.log("Could not detect IP automatically:", errorMessage);
    return null;
  }
};

// Simplified synchronous version for immediate use
export const getLocalIP = (): string => {
  if (!__DEV__) return "https://your-production-url.com";

  // For Android emulator, use the special IP that maps to localhost
  if (Platform.OS === "android") {
    // Default to emulator IP for Android (can be overridden by env var for physical devices)
    const androidIP = process.env.EXPO_PUBLIC_ANDROID_IP || "10.0.2.2";
    return `http://${androidIP}:5000`;
  }

  // For iOS and other platforms, use the local network IP
  const localIP = process.env.EXPO_PUBLIC_LOCAL_IP || "192.168.1.9";
  return `http://${localIP}:5000`;
};
