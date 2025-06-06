# Mobile App Network Configuration

## Automatic IP Detection

The mobile app now automatically detects and configures the correct API endpoint for development.

### Quick Setup

1. **Run the setup script** (only needed once or when your IP changes):
   ```bash
   cd mobile
   npm run setup-ip
   ```

2. **Start your server** (from the root directory):
   ```bash
   npm run dev  # or however you start your server
   ```

3. **Start the mobile app**:
   ```bash
   npm start
   ```

### How It Works

- **Automatic Detection**: The `setup-ip` script detects your local network IP and creates a `.env` file
- **Platform-Specific**: 
  - **Android Emulator**: Automatically uses `10.0.2.2:5000` (emulator's localhost mapping)
  - **Physical Devices**: Uses your actual local IP address (e.g., `192.168.1.9:5000`)
  - **iOS Simulator**: Uses your local IP address
- **Environment Variables**: The app reads configuration from `.env` file via `EXPO_PUBLIC_*` variables

### Configuration Files

- `.env` - Contains your local IP configuration (auto-generated)
- `config/index.ts` - Main configuration file that reads from environment variables
- `scripts/get-local-ip.js` - Script to detect and configure IP addresses

### Debugging

When running in development mode, the app will log:
- 🌐 API Base URL being used
- 📱 Platform (iOS/Android)
- 🔧 Development mode status
- 🏠 Environment variables (if set)

### Manual Configuration

If you need to manually set the IP address:

1. Create or edit `mobile/.env`:
   ```properties
   EXPO_PUBLIC_LOCAL_IP=192.168.1.100
   EXPO_PUBLIC_ANDROID_IP=192.168.1.100
   ```

2. For Android emulator only:
   ```properties
   EXPO_PUBLIC_ANDROID_IP=10.0.2.2
   ```

### Troubleshooting

- **App stuck on login**: Check console logs for API Base URL
- **Network errors**: Ensure your device is on the same WiFi network
- **Android emulator issues**: Make sure `EXPO_PUBLIC_ANDROID_IP=10.0.2.2`
- **IP changed**: Run `npm run setup-ip` again

### Production

In production, the app automatically uses your production URL (set in `config/index.ts`).
