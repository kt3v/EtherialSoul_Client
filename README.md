# EtherialSoul Client

Cross-platform mobile application (iOS, Android, Web) built with React Native and Expo.

## Features

- ✅ Modern dark theme UI with gradients
- ✅ Bottom tab navigation (Dashboard + Chat)
- ✅ Real-time chat with WebSocket
- ✅ Message history display
- ✅ Connection status indicator
- ✅ Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update server URL in `src/config.js` if needed:
```javascript
export const SOCKET_URL = 'http://localhost:3000';
```

3. Start the development server:
```bash
npm start
```

4. Run on specific platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
client/
├── App.js                      # Main app with navigation
├── src/
│   ├── config.js              # Configuration and theme
│   ├── services/
│   │   └── socket.js          # WebSocket service
│   └── screens/
│       ├── ChatScreen.js      # Chat interface
│       └── DashboardScreen.js # Dashboard placeholder
├── assets/                     # Images and icons
├── app.json                   # Expo configuration
└── package.json
```

## Screens

### Dashboard
- Placeholder with statistics
- Navigation button to Chat
- Modern gradient design

### Chat
- Real-time messaging
- Message bubbles (user/AI)
- Connection status
- Typing indicator support (ready for Phase 2)

## Phase 1 Scope

- ✅ Basic UI and navigation
- ✅ WebSocket connection to backend
- ✅ Send/receive messages
- ❌ No typing status yet (Phase 2)
- ❌ No message persistence (Phase 2)
- ❌ No advanced buffer logic (Phase 2)

## Development Notes

- Uses Expo for easy cross-platform development
- Dark theme with purple/cyan accent colors
- Responsive to keyboard on all platforms
- Auto-scrolls to latest message
