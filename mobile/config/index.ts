// Configuration for the mobile app
export const config = {
  // Update this with your computer's local IP address
  // You can find this by running:
  // Windows: ipconfig
  // Mac/Linux: ifconfig
  // Look for your local network IP (usually starts with 192.168.x.x or 10.x.x.x)
  
  // For development, replace this with your actual local IP
  API_BASE_URL: __DEV__ 
    ? "http://localhost:5000" // Replace with your local IP
    : "https://your-production-url.com", // Replace with your production URL
    
  // You can also use Platform to detect different environments
  // API_BASE_URL: Platform.select({
  //   ios: "http://192.168.1.100:5000",
  //   android: "http://10.0.2.2:5000", // Android emulator
  //   default: "http://192.168.1.100:5000",
  // }),
};

// Instructions for finding your local IP:
// 1. Open Command Prompt (Windows) or Terminal (Mac/Linux)
// 2. Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)
// 3. Look for your WiFi adapter's IPv4 address
// 4. Update the IP address above
// 5. Make sure your phone is on the same WiFi network
