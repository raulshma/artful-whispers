# API Endpoints Reference

## Authentication

All endpoints require authentication unless specified otherwise. Include the authentication token in the request header.

## Calendar Data

### Get Calendar Data
```
GET /api/stats/calendar-data
```

**Query Parameters:**
- `year` (optional): Year to fetch data for, defaults to current year
- `month` (optional): Month to fetch data for, defaults to current month

**Response:**
```typescript
Array<{
  day: number,
  mood: 'happy' | 'neutral' | 'sad' | 'negative' | 'skipped' | null,
  hasEntry: boolean
}>
```

## Check-ins

### Create Check-in
```
POST /api/check-ins
```

**Request Body:**
```typescript
{
  mood: string,
  moodCauses: string[],
  moodIntensity: number,
  notes?: string,
  companions: string[],
  location?: string,
  customLocationDetails?: string
}
```

### Get User Check-ins
```
GET /api/check-ins
```

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

## Statistics

### Get Journal Summary
```
GET /api/stats/journal-summary
```

**Query Parameters:**
- `period` (optional): "last30days" | "allTime"

**Response:**
```typescript
{
  positive: number,
  neutral: number,
  negative: number,
  skipped: number, // Entries with no mood or "skipped" mood
  total: number
}
```

### Get Mood Check-in Distribution
```
GET /api/stats/mood-checkin-distribution
```

**Query Parameters:**
- `period` (optional): "currentMonth" | "last7days"

**Response:**
```typescript
Array<{
  mood: string,
  count: number,
  color: string, // e.g., "#4CAF50" for Happy
  icon: string, // e.g., "happy-outline"
  percentage: number
}>
```

Example response:
```json
[
  { "mood": "Happy", "count": 25, "color": "#4CAF50", "icon": "happy-outline", "percentage": 50 },
  { "mood": "Neutral", "count": 15, "color": "#FFC107", "icon": "remove-circle-outline", "percentage": 30 },
  { "mood": "Sad", "count": 10, "color": "#F44336", "icon": "sad-outline", "percentage": 20 }
]
```

## Profile Management

### Get User Profile
```
GET /api/profile
```

**Response:**
```typescript
{
  name: string,
  email: string,
  joinDate: string,
  avatarUrl?: string
}
```

### Update Profile
```
PUT /api/profile
```

**Request Body:**
```typescript
{
  name?: string,
  email?: string,
  avatarUrl?: string
}
```

### Get User Settings
```
GET /api/settings
```

**Response:**
```typescript
{
  notificationsEnabled: boolean,
  reminderEnabled: boolean,
  darkModeEnabled: boolean
}
```

### Update Settings
```
PUT /api/settings
```

**Request Body:**
```typescript
{
  notificationsEnabled?: boolean,
  reminderEnabled?: boolean,
  darkModeEnabled?: boolean
}
```

## Account Management

### Export User Data
```
GET /api/account/export
```

**Response:**
Downloaded file containing all user data in JSON format.

### Delete Account
```
DELETE /api/account
```

Permanently deletes user account and associated data.

## Error Responses

All endpoints follow a consistent error response format:

```typescript
{
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

Common error codes:
- `AUTH_REQUIRED`: Authentication is required
- `INVALID_INPUT`: Request validation failed
- `NOT_FOUND`: Requested resource not found
- `SERVER_ERROR`: Internal server error

## Data Processing Information

### Mood Categorization
The backend uses the following categorization for text-based moods:

**Happy/Positive:**
- happy, joy, excited, grateful
- content, optimistic, cheerful, positive

**Neutral:**
- neutral, calm, okay
- normal, balanced

**Negative:**
- sad, angry, anxious, frustrated
- depressed, worried, stressed, negative

**Special States:**
- skipped: Used for null or empty entries
- custom: User-defined moods that don't fit standard categories