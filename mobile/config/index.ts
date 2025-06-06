import { Platform } from 'react-native';

// Function to get local IP address automatically in development
const getLocalIP = (): string => {
  if (!__DEV__) return "https://your-production-url.com";
  
  // For Android, check if we should use emulator IP or physical device IP
  if (Platform.OS === 'android') {
    // Use environment variable to override, otherwise default to emulator IP
    const androidIP = process.env.EXPO_PUBLIC_ANDROID_IP || "10.0.2.2";
    return `http://${androidIP}:5000`;
  }
  
  // For iOS simulator and physical devices
  const localIP = process.env.EXPO_PUBLIC_LOCAL_IP || "192.168.1.9";
  return `http://${localIP}:5000`;
};

// Configuration for the mobile app
export const config = {
  API_BASE_URL: __DEV__ 
    ? getLocalIP()
    : "https://your-production-url.com", // Replace with your production URL
};

// Log the configuration in development for debugging
if (__DEV__) {
  console.log('🌐 API Base URL:', config.API_BASE_URL);
  console.log('📱 Platform:', Platform.OS);
  console.log('🔧 Development Mode:', __DEV__);
  
  // Show environment variables if set
  if (process.env.EXPO_PUBLIC_LOCAL_IP) {
    console.log('🏠 Local IP (env):', process.env.EXPO_PUBLIC_LOCAL_IP);
  }
  if (process.env.EXPO_PUBLIC_ANDROID_IP) {
    console.log('🤖 Android IP (env):', process.env.EXPO_PUBLIC_ANDROID_IP);
  }
}
