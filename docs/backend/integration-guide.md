# Backend Integration Guide

## Service Architecture

### Storage Layer (`server/storage.ts`)

The storage layer provides data access methods for all features:

```typescript
interface StorageInterface {
  // Calendar Data
  getCalendarData(userId: string, year: number, month: number): Promise<Array<{
    day: number,
    mood: 'happy' | 'neutral' | 'sad' | 'negative' | 'skipped' | null,
    hasEntry: boolean
  }>>;

  // Check-ins
  createCheckIn(userId: string, data: CheckInData): Promise<CheckIn>;
  getCheckIns(userId: string, page: number, limit: number): Promise<CheckInList>;
  
  // Profile
  getUserProfile(userId: string): Promise<UserProfile>;
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
  
  // Settings
  getUserSettings(userId: string): Promise<UserSettings>;
  updateSettings(userId: string, data: Partial<UserSettings>): Promise<UserSettings>;
  
  // Stats
  getJournalSummary(userId: string, period?: string): Promise<JournalSummary>;
  getMoodDistribution(userId: string, period?: string): Promise<MoodDistribution>;
}
```

### API Routes (`server/routes.ts`)

Routes are organized by feature area with consistent patterns:

1. Authentication middleware
2. Request validation
3. Business logic in service layer
4. Standardized response format

Example route implementation:
```typescript
import { validateCheckIn } from '../shared/schema';
import { CheckInService } from './services';

router.post('/api/check-ins', 
  authenticate,
  async (req, res) => {
    const userId = req.user.id;
    const data = validateCheckIn(req.body);
    
    const checkIn = await CheckInService.create(userId, data);
    res.status(201).json(checkIn);
  }
);
```

## Authentication

### Session Management
- Token-based authentication
- Session encryption using `ENCRYPTION_KEY`
- Secure cookie handling

### Protected Routes
```typescript
import { authenticate } from './middleware';

router.use('/api/*', authenticate);
```

## Data Flow Patterns

### Calendar Integration

1. **Data Retrieval**
```typescript
// Get entries for month
const entries = await db.query(diary_entries)
  .where(eq(diary_entries.userId, userId))
  .where(between(
    diary_entries.createdAt,
    startOfMonth,
    endOfMonth
  ));

// Map to calendar format
const calendarData = days.map(day => ({
  day: day.getDate(),
  mood: getMoodForDay(entries, day),
  hasEntry: hasEntryForDay(entries, day)
}));
```

2. **Mood Categorization**
```typescript
function categorizeMood(textMood: string): MoodCategory {
  if (POSITIVE_MOODS.includes(textMood)) return 'happy';
  if (NEGATIVE_MOODS.includes(textMood)) return 'sad';
  return 'neutral';
}
```

### Check-in Flow

1. **Data Validation**
```typescript
const checkInSchema = z.object({
  mood: z.string(),
  moodCauses: z.array(z.string()),
  moodIntensity: z.number().min(1).max(10),
  notes: z.string().optional(),
  companions: z.array(z.string()),
  location: z.string().optional()
});
```

2. **Storage Operations**
```typescript
async function createCheckIn(userId: string, data: CheckInData) {
  const checkIn = await db.insert(check_ins).values({
    userId,
    ...data,
    created_at: new Date()
  });
  
  await updateUserStats(userId);
  return checkIn;
}
```

### Profile Management

1. **Profile Updates**
```typescript
async function updateProfile(userId: string, data: Partial<UserProfile>) {
  const profile = await db.transaction(async (tx) => {
    const updated = await tx.update(user_profiles)
      .set(data)
      .where(eq(user_profiles.userId, userId));
      
    return updated;
  });
  
  return profile;
}
```

2. **Settings Sync**
```typescript
async function syncUserSettings(userId: string) {
  const settings = await getUserSettings(userId);
  await updateCachedSettings(userId, settings);
  return settings;
}
```

## Error Handling

### Standardized Error Response
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
}

function handleApiError(err: any): ApiError {
  if (err instanceof ValidationError) {
    return {
      code: 'INVALID_INPUT',
      message: 'Validation failed',
      details: err.errors
    };
  }
  
  return {
    code: 'SERVER_ERROR',
    message: 'Internal server error'
  };
}
```

### Transaction Management
```typescript
async function atomicOperation() {
  return await db.transaction(async (tx) => {
    try {
      // Multiple database operations
      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  });
}
```

## Performance Considerations

### Query Optimization
- Use appropriate indexes
- Implement pagination
- Optimize JOIN operations

### Caching Strategy
```typescript
const cache = new NodeCache({ stdTTL: 600 });

async function getCachedData(key: string, getter: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached) return cached;
  
  const data = await getter();
  cache.set(key, data);
  return data;
}
```

### Batch Operations
```typescript
async function batchUpdateStats(userIds: string[]) {
  return await db.transaction(async (tx) => {
    for (const userId of userIds) {
      await updateUserStats(tx, userId);
    }
  });
}