# Authentication Documentation

## Overview

The application uses token-based authentication with secure session management. Authentication is required for all API endpoints except explicitly public routes.

## Implementation

### Authentication Flow

1. **Login Process**
```typescript
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  }
}
```

2. **Token Generation**
```typescript
function generateAuthToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.ENCRYPTION_KEY,
    { expiresIn: '7d' }
  );
}
```

3. **Session Management**
```typescript
interface Session {
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}
```

## Middleware Implementation

### Authentication Middleware (`server/middleware.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = getTokenFromHeader(req);
  if (!token) {
    return res.status(401).json({
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Authentication required'
      }
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
}
```

## Client Implementation

### Auth Context (`mobile/contexts/AuthContext.tsx`)

```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });
    
    const { token, user } = response.data;
    await secureStore.setItem('authToken', token);
    setUser(user);
  };

  const logout = async () => {
    await secureStore.deleteItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### API Client Configuration (`mobile/lib/api.ts`)

```typescript
import axios from 'axios';
import { getAuthToken } from './auth';

const apiClient = axios.create({
  baseURL: API_BASE_URL
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      eventEmitter.emit('auth:expired');
    }
    return Promise.reject(error);
  }
);
```

## Security Considerations

### Token Storage
- Mobile: Secure storage using Expo SecureStore
- Web: HttpOnly cookies with secure flags

### Token Validation
```typescript
function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, process.env.ENCRYPTION_KEY);
  } catch (err) {
    throw new AuthError('Invalid token');
  }
}
```

### Session Security
- Token expiration (7 days)
- Token rotation on sensitive operations
- Rate limiting on auth endpoints

### Protected Route Component (`mobile/components/ProtectedRoute.tsx`)

```typescript
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigation.navigate('auth');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return user ? children : null;
}
```

## Error Handling

### Authentication Errors

```typescript
enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  AUTH_REQUIRED = 'AUTH_REQUIRED'
}

interface AuthError {
  code: AuthErrorCode;
  message: string;
}
```

### Client-side Error Handling

```typescript
try {
  await auth.login(email, password);
  navigation.navigate('home');
} catch (error) {
  if (error.code === 'INVALID_CREDENTIALS') {
    Alert.alert('Error', 'Invalid email or password');
  } else {
    Alert.alert('Error', 'An unexpected error occurred');
  }
}