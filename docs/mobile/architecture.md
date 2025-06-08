# Mobile Application Architecture

## Core Architecture

### Directory Structure
```
mobile/
├── app/                   # Expo Router pages
│   ├── (tabs)/           # Tab-based navigation
│   ├── checkin/          # Check-in flow
│   └── journal/          # Journal entries
├── components/           # Reusable components
│   ├── ui/              # Core UI components
│   └── skia/            # Skia-based components
├── contexts/            # React Context providers
├── services/            # API service layer
└── lib/                 # Utilities and config
```

## State Management

### Context Providers

1. **Auth Context** (`contexts/AuthContext.tsx`)
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}
```

2. **Theme Context** (`contexts/ThemeContext.tsx`)
```typescript
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}
```

3. **Check-in Context** (`contexts/CheckInContext.tsx`)
```typescript
interface CheckInContextType {
  mood: string;
  moodIntensity: number;
  moodCauses: string[];
  companions: string[];
  location: string;
  notes: string;
  updateMood: (mood: string) => void;
  updateDetails: (details: Partial<CheckInData>) => void;
  resetCheckIn: () => void;
}
```

## Feature Implementation

### Check-in Flow Architecture

1. **State Management**
- React Context for cross-step data persistence
- TanStack Query for API integration
- Step-specific local state for UI

2. **Flow Implementation**
```typescript
// Step Components
app/
  checkin/
    step1.tsx  // Mood Selection
    step2.tsx  // Mood Details
    step3.tsx  // Companions
    step4.tsx  // Location
    complete.tsx // Submission
```

3. **Data Flow Pattern**
```typescript
// Check-in Service
export class CheckInService {
  static async submit(data: CheckInData): Promise<CheckInResponse> {
    const response = await apiClient.post('/check-ins', data);
    queryClient.invalidateQueries(['checkIns']);
    return response.data;
  }
}

// Usage in Components
const { mutate, isLoading } = useMutation({
  mutationFn: CheckInService.submit,
  onSuccess: () => {
    navigation.navigate('checkin/complete');
    checkInContext.resetCheckIn();
  }
});
```

## API Integration

### Service Layer (`services/`)

1. **Base API Client** (`lib/api.ts`)
```typescript
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(addAuthHeader);
apiClient.interceptors.response.use(handleResponse, handleError);
```

2. **Query Client Configuration** (`lib/queryClient.ts`)
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2
    }
  }
});
```

### Data Fetching Patterns

1. **List Data**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['checkIns'],
  queryFn: () => CheckInService.getList()
});
```

2. **Mutations**
```typescript
const { mutate } = useMutation({
  mutationFn: CheckInService.submit,
  onSuccess: (data) => {
    queryClient.setQueryData(['checkIns'], old => [data, ...old]);
  }
});
```

## Navigation

### Expo Router Configuration

1. **Tab Navigation** (`app/(tabs)/_layout.tsx`)
```typescript
const TabLayout = () => (
  <Tabs
    screenOptions={{
      tabBarStyle: styles.tabBar,
      headerShown: false
    }}>
    <Tab.Screen name="index" options={{ title: 'Home' }} />
    <Tab.Screen name="checkin" options={{ title: 'Check In' }} />
    <Tab.Screen name="stats" options={{ title: 'Stats' }} />
  </Tabs>
);
```

2. **Protected Routes** (`components/ProtectedRoute.tsx`)
```typescript
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigation.navigate('auth');
    }
  }, [user, isLoading]);

  return user ? children : null;
}
```

## Error Handling

### API Error Handling
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
}

function handleApiError(error: any) {
  if (error.response?.status === 401) {
    // Handle authentication errors
    navigation.navigate('auth');
  }
  
  // Show error toast
  Toast.show({
    type: 'error',
    message: error.message || 'An error occurred'
  });
}
```

### Offline Support
```typescript
function withOfflineSupport<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  return operation().catch(error => {
    if (!navigator.onLine) {
      return fallback;
    }
    throw error;
  });
}
```

## Performance Optimization

1. **Query Caching**
- Appropriate stale times for different data types
- Prefetching for common navigation paths
- Background data updates

2. **Component Optimization**
```typescript
// Memoize expensive components
const MoodChart = React.memo(({ data }) => {
  // Chart rendering logic
});

// Use callback for stable functions
const handleMoodSelect = useCallback((mood: string) => {
  setMood(mood);
}, []);
```

3. **Image Optimization**
```typescript
<Image
  source={source}
  placeholder={blurHash}
  contentFit="cover"
  transition={200}
/>