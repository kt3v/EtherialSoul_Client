# EtherialSoul Client - Project Structure

## Overview
React Native (Expo) application with organized, scalable architecture.

## Directory Structure

```
EtherialSoul_Client/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── AuthModal.js
│   │
│   ├── constants/           # App-wide constants and configuration
│   │   ├── config.js        # API URLs, Supabase config, environment settings
│   │   └── index.js         # Barrel export
│   │
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.js   # Authentication state management
│   │
│   ├── hooks/               # Custom React hooks (future)
│   │
│   ├── navigation/          # Navigation configuration (future)
│   │
│   ├── screens/             # Screen components
│   │   ├── ChatScreen.js    # Main chat interface
│   │   └── DashboardScreen.js
│   │
│   ├── services/            # External service integrations
│   │   ├── socket.js        # WebSocket service
│   │   └── supabase.js      # Supabase client
│   │
│   └── theme/               # Styling and theming
│       ├── colors.js        # Color palette
│       └── index.js         # Barrel export
│
├── assets/                  # Static assets (images, fonts)
├── App.js                   # Root component
├── app.json                 # Expo configuration
├── babel.config.js          # Babel configuration
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables (gitignored)
├── .env.example             # Example environment variables
└── README.md                # Project documentation
```

## Import Patterns

### Theme/Colors
```javascript
import { COLORS } from '../theme';
```

### Configuration
```javascript
import { SOCKET_URL, API_CONFIG, SUPABASE_CONFIG } from '../constants';
```

### Services
```javascript
import socketService from '../services/socket';
import { supabase } from '../services/supabase';
```

### Components
```javascript
import AuthModal from '../components/AuthModal';
```

### Contexts
```javascript
import { useAuth } from '../contexts/AuthContext';
```

## Key Features

### 1. Separation of Concerns
- **Components**: Reusable UI elements
- **Screens**: Full-page views
- **Services**: External API/service integrations
- **Constants**: Configuration and static values
- **Theme**: Styling and design tokens

### 2. Scalability
- Easy to add new screens, components, or services
- Clear organization makes navigation intuitive
- Barrel exports (`index.js`) simplify imports

### 3. Maintainability
- Related files grouped together
- Consistent import patterns
- Clear naming conventions

## Future Enhancements

### Hooks Directory
Custom React hooks for shared logic:
- `useSocket.js` - Socket connection management
- `useChat.js` - Chat state management
- `useKeyboard.js` - Keyboard handling

### Navigation Directory
Centralized navigation configuration:
- `RootNavigator.js` - Main navigation structure
- `AuthNavigator.js` - Authentication flow
- `MainNavigator.js` - Authenticated app flow

### Utils Directory
Helper functions and utilities:
- `validation.js` - Input validation
- `formatting.js` - Text/date formatting
- `storage.js` - AsyncStorage helpers

## Best Practices

1. **Always use barrel exports** - Import from directory index files
2. **Keep components small** - Single responsibility principle
3. **Use absolute imports** - Configure in `babel.config.js` if needed
4. **Colocate related files** - Keep tests, styles near components
5. **Follow naming conventions** - PascalCase for components, camelCase for utilities
