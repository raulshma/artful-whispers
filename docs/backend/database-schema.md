# Database Schema Reference

## Tables Overview

### check_ins
Stores user mood check-in data with comprehensive mood tracking fields.

```sql
CREATE TABLE check_ins (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  mood_causes JSONB DEFAULT '[]',
  mood_intensity INTEGER NOT NULL,
  notes TEXT,
  companions JSONB DEFAULT '[]',
  location TEXT,
  custom_location_details TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### diary_entries
Stores journal entries with mood categorization.

**Key Fields:**
- `id`: Entry identifier
- `user_id`: Reference to users table
- `mood`: Text field indicating emotional state
  - Categorized as: "positive", "neutral", "negative", "skipped"
- `content`: Entry text content
- `created_at`: Timestamp of creation

### user_profiles
Stores user profile information and preferences.

**Fields:**
- `user_id`: References User table
- `name`: User's display name
- `email`: Unique email address
- `join_date`: Account creation timestamp
- `avatar_url`: Optional profile image URL

### user_settings
Stores user-specific application settings.

**Fields:**
- `user_id`: References User table
- `notifications_enabled`: Boolean
- `reminder_enabled`: Boolean
- `dark_mode_enabled`: Boolean

### user_stats
Stores or calculates user activity statistics.

**Fields:**
- `user_id`: References User table
- `check_ins_count`: Total number of check-ins
- `journal_entries_count`: Total journal entries
- `current_streak`: Current consecutive days streak
- `longest_streak`: Longest achieved streak

## Relationships

1. **User → Check-ins**: One-to-many
   - A user can have multiple check-ins
   - Each check-in belongs to one user

2. **User → Diary Entries**: One-to-many
   - A user can have multiple diary entries
   - Each entry belongs to one user

3. **User → Profile**: One-to-one
   - Each user has one profile
   - Each profile belongs to one user

4. **User → Settings**: One-to-one
   - Each user has one settings record
   - Each settings record belongs to one user

## Mood Categorization

The system uses text-based mood categorization with the following mapping:

### Positive Moods
- happy
- joy
- excited
- grateful
- content
- optimistic
- cheerful
- positive

### Neutral Moods
- neutral
- calm
- okay
- normal
- balanced

### Negative Moods
- sad
- angry
- anxious
- frustrated
- depressed
- worried
- stressed
- negative

### Special States
- skipped: Used for null or empty entries
- custom: User-defined moods that don't fit standard categories

## Indexing Strategy

1. **Primary Check-in Queries**
   - Index on `user_id` and `created_at` for efficient timeline queries
   - Index on `mood` for mood distribution calculations

2. **Diary Entry Access**
   - Composite index on `user_id` and `created_at` for chronological access
   - Index on `mood` for emotional trend analysis

3. **User Data Retrieval**
   - Primary key lookups on `user_id` across all tables
   - Index on `email` in user_profiles for unique constraint and lookups