import { Platform } from "react-native";

// Function to get local IP address automatically in development
const getLocalIP = (): string => {
  if (!__DEV__) return "https://your-production-url.com";

  // For web, use localhost
  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }

  // For Android, check if we should use emulator IP or physical device IP
  if (Platform.OS === "android") {
    // First try the environment variable for Android-specific IP
    if (process.env.EXPO_PUBLIC_ANDROID_IP) {
      return `http://${process.env.EXPO_PUBLIC_ANDROID_IP}:5000`;
    }

    // If no specific Android IP, try to use the same local IP as iOS
    // This works for physical Android devices on the same network
    const localIP = process.env.EXPO_PUBLIC_LOCAL_IP || "192.168.1.9";
    return `http://${localIP}:5000`;

    // Note: For Android emulator, you would need to set EXPO_PUBLIC_ANDROID_IP=10.0.2.2
  }

  // For iOS simulator and physical devices
  const localIP = process.env.EXPO_PUBLIC_LOCAL_IP || "192.168.1.3";
  return `http://${localIP}:5000`;
};

// Configuration for the mobile app
export const config = {
  API_BASE_URL: __DEV__ ? getLocalIP() : "https://your-production-url.com", // Replace with your production URL
};

// Log the configuration in development for debugging
if (__DEV__) {
  console.log("🌐 API Base URL:", config.API_BASE_URL);
  console.log("📱 Platform:", Platform.OS);
  console.log("🔧 Development Mode:", __DEV__);

  // Show environment variables if set
  if (process.env.EXPO_PUBLIC_LOCAL_IP) {
    console.log("🏠 Local IP (env):", process.env.EXPO_PUBLIC_LOCAL_IP);
  }
  if (process.env.EXPO_PUBLIC_ANDROID_IP) {
    console.log("🤖 Android IP (env):", process.env.EXPO_PUBLIC_ANDROID_IP);
  }

  // Web-specific debugging
  if (Platform.OS === "web") {
    console.log("🌐 Web platform detected, using localhost:5000");
    console.log(
      "🔍 Current URL:",
      typeof window !== "undefined" ? window.location.href : "N/A"
    );
  }
}
