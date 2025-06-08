# Mobile App Development Setup

## Network Configuration

### API Endpoint Configuration

The mobile app automatically detects and configures the correct API endpoint for development environments.

#### Development Configuration

1. **Local IP Detection**
```bash
cd mobile
npm run setup-ip
```

The setup script:
- Detects your local network IP
- Creates appropriate `.env` file
- Configures platform-specific endpoints

2. **Platform-Specific Endpoints**
- Android Emulator: `10.0.2.2:5000` (emulator's localhost mapping)
- Physical Devices: Local IP address (e.g., `192.168.1.9:5000`)
- iOS Simulator: Local IP address

### Environment Variables

Located in `mobile/.env`:
```properties
EXPO_PUBLIC_LOCAL_IP=192.168.1.100
EXPO_PUBLIC_ANDROID_IP=10.0.2.2
```

### Configuration Files
- `.env` - Contains IP configuration (auto-generated)
- `config/index.ts` - Main configuration file
- `scripts/get-local-ip.js` - IP detection script

## Development Environment

### Required Dependencies

```json
{
  "dependencies": {
    "react-native-skia": "^0.1.0",
    "react-navigation": "^6.0.0",
    "react-native-reanimated": "^3.0.0",
    "react-native-gesture-handler": "^2.0.0",
    "expo-av": "^13.0.0",
    "expo-haptics": "^12.0.0",
    "date-fns": "^2.0.0",
    "react-native-svg": "^13.0.0",
    "zustand": "^4.0.0",
    "react-native-maps": "^1.0.0"
  }
}
```

### Directory Structure

```
mobile/
├── app/
│   ├── (tabs)/
│   ├── journal/
│   └── checkin/
├── assets/
│   ├── fonts/
│   └── images/
├── components/
│   ├── ui/
│   └── skia/
├── contexts/
├── hooks/
├── lib/
└── config/
```

### Asset Configuration

#### Fonts
- Inter (Regular, Medium, SemiBold)
- SpaceMono (Regular)

Configure in `app.json`:
```json
{
  "expo": {
    "fonts": [
      {
        "Inter-Regular": "./assets/fonts/Inter-Regular.ttf"
      }
    ]
  }
}
```

### State Management

1. **API State**
- TanStack Query for server state
- Configure in `lib/queryClient.ts`

2. **Local State**
- React Context for theme, auth
- Zustand for complex local state

## Environment-Specific Features

### Development Mode
- API endpoint logging
- Platform detection logging
- Environment variable validation
- Development mode indicators

### Production Mode
- Uses production API URL
- Disabled development logging
- Optimized performance settings

## Troubleshooting

### Common Issues

1. **Login Screen Issues**
- Check API Base URL in console logs
- Verify network connectivity
- Confirm correct IP configuration

2. **Android Emulator Connection**
- Ensure `EXPO_PUBLIC_ANDROID_IP=10.0.2.2`
- Verify server is running on port 5000
- Check emulator network settings

3. **Physical Device Testing**
- Device must be on same WiFi network
- Update local IP if network changes
- Run `npm run setup-ip` after IP changes

### Development Tools

1. **Network Debugging**
- React Native Debugger
- Chrome Developer Tools
- Network request logging

2. **Performance Monitoring**
- React Native Performance Monitor
- Metro Bundler console
- React DevTools

## Security Considerations

1. **API Communication**
- HTTPS enforced in production
- Certificate pinning recommended
- Request/response encryption

2. **Environment Variables**
- Sensitive values in `.env`
- Production secrets management
- Environment separation