# Artful Whispers v1.0.0  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

## Description
Artful Whispers is a comprehensive, self-hosted AI-powered platform for creative content generation and sharing. It leverages multiple AI models to help users create, refine, and share various types of creative content including stories, poetry, art prompts, and visual designs. Whether you're a creative professional looking to enhance your workflow or an enthusiast exploring AI-assisted creativity, Artful Whispers provides the tools and community to bring your ideas to life.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)  
- [Prerequisites](#prerequisites)  
- [Environment Variables](#environment-variables)  
- [Getting Started](#getting-started)  
- [Project Structure](#project-structure)  
- [Configuration](#configuration)  
- [Available Scripts](#available-scripts)  
- [Build & Production](#build--production)  
- [Contributing](#contributing)  
- [License](#license)  

## Features

### Content Generation
- **Multi-Model AI Integration**: Connect to Google Gemini, OpenAI, or Anthropic models based on your preference and API availability
- **Text Generation**: Create stories, poems, scripts, and other written content with AI assistance
- **Visual Prompt Engineering**: Generate detailed prompts for visual art creation
- **Content Refinement**: Edit and refine generated content with AI suggestions
- **Style Transfer**: Apply different creative styles to your existing content

### User Experience
- **Responsive Design**: Fully responsive interface that works across desktop, tablet, and mobile devices
- **Customizable Workspace**: Personalize your creative environment with themes and layout options
- **Collaboration Tools**: Share projects, receive feedback, and collaborate with others
- **Version History**: Track changes and maintain multiple versions of your creative works
- **Export Options**: Download your content in various formats (PDF, TXT, JSON)

### Platform
- **Self-Hosted Solution**: Full control over your data and AI integrations
- **User Management**: Multi-user support with roles and permissions
- **Content Library**: Organize and search through your generated content
- **API Access**: Integrate with other tools and services via REST API
- **Privacy-Focused**: Keep your creative process and data secure

### Community
- **Public/Private Sharing**: Choose what content to share and with whom
- **Inspiration Feed**: Discover content shared by other users (optional)
- **Collaboration Spaces**: Create shared workspaces for team projects
- **Feedback System**: Request and provide constructive feedback

## Tech Stack
- **Frontend**
  - React 18, Vite, TypeScript  
  - Tailwind CSS, Framer Motion  
  - Radix UI, shadcn/ui (New York style)  
- **Backend**
  - Node.js, Express  
  - Drizzle ORM & migrations  
  - Zod & drizzle-zod for schema validation  
  - openid-client for OAuth  
- **Database & Storage**
  - PostgreSQL (via @neondatabase/serverless)  
  - Vercel Blob Storage (@vercel/blob)  
- **AI Integrations**
  - Google Gemini, OpenAI, Anthropic  
  - @google/genai, @google/generative-ai  
- **Utilities**
  - better-auth, @better-auth/expo  
  - nanoid, clsx, date-fns  

## Prerequisites
- Node.js >= 16  
- pnpm package manager  
- PostgreSQL instance (local or hosted)

## Environment Variables
Copy and rename `.env.example` to `.env`.  

| Variable                | Description                                 | Required |
|-------------------------|---------------------------------------------|:--------:|
| `DATABASE_URL`          | PostgreSQL connection URL                   | Yes      |
| `ENCRYPTION_KEY`        | Key for data encryption                     | Yes      |
| `PGSSLMODE`             | PostgreSQL SSL mode (default: disable)      | No       |
| `NODE_ENV`              | Node environment (default: development)     | No       |
| `GEMINI_API_KEY`        | Google Gemini API key                       | No       |
| `OPENAI_API_KEY`        | OpenAI API key                              | No       |
| `ANTHROPIC_API_KEY`     | Anthropic API key                           | No       |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Storage read/write token        | No       |

## Getting Started
```bash
git clone <repository-url>
cd artful-whispers
pnpm install
cp .env.example .env
pnpm db:push       # apply database migrations
pnpm dev           # start dev server (frontend + backend)
```

## Project Structure
```
.
├── client/           # React application (src, index.html, index.css)
├── server/           # Express server entrypoint (server/index.ts)
├── shared/           # Shared schema, types, utilities
├── migrations/       # Drizzle-generated migrations
├── attached_assets/  # Static assets alias (@assets)
├── tsconfig.json     # TypeScript configuration & path aliases
├── vite.config.ts    # Vite configuration & aliases
├── tailwind.config.ts# Tailwind CSS theme & plugins
├── drizzle.config.ts # Drizzle ORM configuration
└── components.json   # shadcn UI component generator config
```

## Configuration

**Path Aliases**  
- In `tsconfig.json`:
  - `"@/*"` → `client/src/*`  
  - `"@shared/*"` → `shared/*`  
- In `vite.config.ts`:
  - `"@"` → `client/src`  
  - `"@shared"` → `shared`  
  - `"@assets"` → `attached_assets`  
- In `components.json` (shadcn/ui):
  - `"components"` → `@/components`  
  - `"utils"` → `@/lib/utils`  
  - `"ui"` → `@/components/ui`  
  - `"lib"` → `@/lib`  
  - `"hooks"` → `@/hooks`  

**Tailwind CSS**  
- Dark mode via `class` strategy  
- Content paths: `./client/index.html`, `./client/src/**/*.{js,jsx,ts,tsx}`  
- Extended theme: custom radius, colors, charts, sidebar, keyframes & animations  
- Plugins: `tailwindcss-animate`, `@tailwindcss/typography`  

## Available Scripts
From `package.json`:
- `pnpm dev`  
  Start development server (Vite + Express).  
- `pnpm build`  
  Build frontend (Vite) and bundle backend (esbuild).  
- `pnpm start`  
  Run production server (`dist/index.js`).  
- `pnpm check`  
  Run TypeScript type checks (`tsc`).  
- `pnpm db:push`  
  Push migrations to the database (Drizzle Kit).  

## Build & Production
```bash
pnpm build        # generate production assets
pnpm start        # start production server
```
- Frontend output: `dist/public/`  
- Backend bundle: `dist/index.js`  

## Contributing
Please follow code conventions (Prettier, ESLint) and branch naming like `feature/xyz` or `fix/abc`. Submit PRs against `main`.  

## License
This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for details.