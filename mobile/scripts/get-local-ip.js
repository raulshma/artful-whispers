#!/usr/bin/env node

const os = require("os");
const fs = require("fs");
const path = require("path");

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const results = [];

  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === "IPv4" && !interface.internal) {
        results.push({
          name,
          address: interface.address,
        });
      }
    }
  }

  return results;
}

function createEnvFile(ip) {
  const envContent = `# Auto-generated environment variables for local development
# Generated on ${new Date().toISOString()}

# Your local network IP address for iOS devices and iOS simulator
EXPO_PUBLIC_LOCAL_IP=${ip}

# Android physical device IP (use the same as LOCAL_IP)
# For Android emulator, this should be 10.0.2.2 (which is the default)
EXPO_PUBLIC_ANDROID_IP=${ip}

# Uncomment the line below if testing on Android emulator instead of physical device
# EXPO_PUBLIC_ANDROID_IP=10.0.2.2
`;

  const envPath = path.join(process.cwd(), ".env");
  fs.writeFileSync(envPath, envContent);
  console.log("✅ Created .env file with IP configuration");
}

console.log("🔍 Detecting Local IP Addresses...");
console.log("====================================");

const interfaces = getLocalIP();

if (interfaces.length === 0) {
  console.log("❌ No local IP addresses found");
  process.exit(1);
}

console.log("Found the following network interfaces:");
interfaces.forEach((iface, index) => {
  console.log(`${index + 1}. ${iface.name}: ${iface.address}`);
});

// Find the most likely WiFi interface
const wifiInterface = interfaces.find(
  (iface) =>
    iface.name.toLowerCase().includes("wi-fi") ||
    iface.name.toLowerCase().includes("wifi") ||
    iface.name.toLowerCase().includes("wireless") ||
    iface.address.startsWith("192.168.") ||
    iface.address.startsWith("10.0.")
);

if (wifiInterface) {
  console.log(
    `\n🎯 Recommended IP: ${wifiInterface.address} (${wifiInterface.name})`
  );
  createEnvFile(wifiInterface.address);
} else {
  console.log(`\n🎯 Using first available IP: ${interfaces[0].address}`);
  createEnvFile(interfaces[0].address);
}

console.log("\n📋 Next Steps:");
console.log("1. Make sure your server is running on port 5000");
console.log("2. Ensure your mobile device is on the same WiFi network");
console.log("3. Restart your mobile app to pick up the new configuration");
console.log("4. Check the console logs in your app for the API Base URL");
console.log(
  "\n💡 If using Android emulator, the app will automatically use 10.0.2.2:5000"
);
