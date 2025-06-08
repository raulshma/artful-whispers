# 🌟 Artful Whispers

A beautifully crafted digital diary application that transforms your daily reflections into visual art. Artful Whispers combines mindful journaling with AI-powered sentiment analysis and automatic image generation to create a unique, immersive journaling experience.

## ✨ Features

### 📝 **Intelligent Journaling**

- Create unlimited diary entries throughout the day
- AI-powered title generation based on content
- Automatic sentiment analysis and emotion detection
- Multiple entries per day with smart time-based prompting

### 🎨 **AI-Generated Artwork**

- Automatic lofi-style image generation for each entry using Google Gemini
- Personalized artwork based on your emotions and mood
- Dynamic background imagery that adapts to your current entry
- Beautiful, aesthetic visuals that capture the essence of your reflections

### 🔐 **Secure Authentication**

- Email and password authentication powered by Better Auth
- Protected routes and secure session management
- User profile customization with personal details

### 🌙 **Adaptive User Experience**

- Dark/Light theme toggle with smooth transitions
- Mobile-responsive design with touch-optimized interactions
- Infinite scroll for seamless browsing of past entries
- Time-aware prompts to encourage regular journaling

### 🔍 **Smart Organization**

- Search through your diary entries by content, title, or mood
- Date-based organization and filtering
- Visual timeline of your emotional journey
- Entry grouping for multiple reflections on the same day

## 🛠️ Tech Stack

### **Frontend**

- **React 19** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling with custom theme system
- **Framer Motion** for smooth animations and transitions
- **Radix UI** components for accessibility
- **React Query** for state management and data fetching
- **React Router** for client-side navigation

### **Mobile**

- **React Native** with TypeScript
- **Expo** for universal app development
- **Skia** for high-performance 2D graphics

### **Backend**

- **Express.js** with TypeScript
- **Better Auth** for authentication and session management
- **Drizzle ORM** with PostgreSQL database
- **Google Gemini AI** for text analysis and image generation
- **Vercel Blob** for image storage

### **Database & Storage**

- **PostgreSQL**
- **Drizzle Kit** for database migrations
- **Vercel Blob** for image asset storage

### **AI & ML**

- **Google Gemini 2.0** for sentiment analysis
- **Google Gemini Image Generation** for automatic artwork creation
- Personalized prompts based on user profile and preferences

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Google Gemini API key
- Vercel account for blob storage

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/artful-whispers.git
   cd artful-whispers
   ```

2. **Install dependencies**
   For the web client and server:

   ```bash
   pnpm install
   ```

   For the mobile app, navigate to the `mobile` directory:

   ```bash
   cd mobile
   npm install # or pnpm install if consistent across project
   cd ..
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="your_postgresql_connection_string"
   GEMINI_API_KEY="your_google_gemini_api_key"
   BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
   BETTER_AUTH_SECRET="your_auth_secret_key"
   NODE_ENV="development"
   ```

4. **Database Setup**

   ```bash
   pnpm db:push
   ```

5. **Start Development Server**

   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:5000`

   To run the mobile app:

   ```bash
   cd mobile
   npx expo start
   ```

   Follow the instructions in the terminal to open the app in an emulator or on a physical device. For more details, see `mobile/README.md`.

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
artful-whispers/
├── client/                 # React frontend (web)
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Radix UI components
│   │   │   └── ...         # Custom components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Page components
│   │   └── ...
│   └── index.html
├── server/                 # Express backend
│   ├── auth.ts            # Authentication setup
│   ├── db.ts              # Database configuration
│   ├── index.ts           # Server entry point
│   ├── middleware.ts      # Express middleware
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── vite.ts            # Vite integration
├── mobile/                 # React Native mobile app (Expo)
│   ├── app/               # App screens and navigation
│   ├── assets/            # Static assets (images, fonts)
│   ├── components/        # Mobile-specific components
│   ├── contexts/          # Mobile-specific React contexts
│   ├── hooks/             # Mobile-specific React hooks
│   ├── lib/               # Mobile utility libraries
│   └── ...
├── shared/                 # Shared types and schemas
│   ├── schema.ts          # Database schema and types
│   └── utils/
├── docs/                   # Technical documentation
│   ├── README.md          # Main documentation page
│   ├── api/               # API documentation
│   ├── backend/           # Backend documentation
│   └── mobile/            # Mobile documentation
├── migrations/             # Database migrations
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
└── README.md
```

## 📚 Technical Documentation

For detailed technical documentation, including API specifications, database schemas, and architecture details, please refer to the [Technical Documentation (docs/README.md)](docs/README.md).

## 🎯 Key Features Deep Dive

### **AI-Powered Content Analysis**

- Analyzes diary entries using Google Gemini to determine mood and emotions
- Generates personalized, poetic titles for each entry
- Creates detailed image prompts based on emotional content
- Adapts to user's personal profile (gender, nationality, languages)

### **Dynamic Visual Experience**

- Background images change based on the currently viewed entry
- Smooth transitions between different moods and themes
- Lofi-aesthetic artwork generation that matches your emotional state
- Theme-aware overlays for optimal readability

### **Smart User Engagement**

- Evening prompts to encourage reflection (after 8 PM)
- Intelligent spacing between prompts (2-hour minimum)
- Multiple entries per day support
- Visual indicators for productive journaling days

### **Responsive Design**

- Mobile-first approach with touch-optimized interfaces
- Adaptive layouts for desktop, tablet, and mobile
- Accessibility features with proper ARIA labels
- Smooth animations that enhance user experience

## 📊 Database Schema

### Users Table

- Personal profile information
- Timezone and language preferences
- Onboarding status tracking
- Authentication data

### Diary Entries Table

- Entry content and metadata
- AI-generated titles and sentiment data
- Image URLs and prompts
- Date and time tracking

### Authentication Tables

- Sessions and tokens management
- Account linking and verification
- Secure credential storage

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/sign-in` - User sign in
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-out` - User sign out

### User Management

- `GET /api/user` - Get current user
- `PATCH /api/user/profile` - Update user profile
- `POST /api/user/onboard` - Complete onboarding

### Diary Entries

- `GET /api/diary-entries` - Get entries with pagination
- `POST /api/diary-entries` - Create new entry
- `PATCH /api/diary-entries/:id` - Update entry
- `GET /api/diary-entries/search` - Search entries
- `GET /api/diary-entries/date/:date` - Get entries by date

## 🌟 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **Radix UI** for accessible component primitives
- **Vercel** for seamless deployment and blob storage
- **Better Auth** for robust authentication

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/raulshma/artful_whispers/issues) page to report bugs or request features.

---

**Made with ❤️ for mindful reflection and creative expression**
