# EduTex - Instructional Design Workspace

A modern, AppFlowy-inspired workspace application for instructional designers. Built with Next.js, TypeScript, Prisma, and AI integration.

## Project Status

### Phase 1: Foundation - ✅ COMPLETE

- ✅ Next.js 14+ with TypeScript and Tailwind CSS
- ✅ PostgreSQL + Prisma ORM with comprehensive schema
- ✅ NextAuth.js with OAuth providers (Google, GitHub)
- ✅ Base layout structure (sidebar, top bar, main canvas)
- ✅ AI provider abstraction layer (OpenAI + Anthropic)

### Next Steps

- Build block-based page editor
- Create Needs Analysis page template
- Implement AI-assisted analysis features
- Create Learning Objectives page template
- Build objectives database views
- Add project templates
- Implement PDF export

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5 with OAuth (Google, GitHub, Microsoft)
- **AI**: OpenAI GPT-4 + Anthropic Claude with abstraction layer
- **Deployment**: Vercel (recommended) or self-hosted

## Project Structure

```
app/
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── workspace/       # Main workspace UI
│   └── ...
├── components/          # React components
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   └── ...
├── lib/                 # Utilities and services
│   ├── ai/             # AI provider abstraction
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── openai-provider.ts
│   │   ├── anthropic-provider.ts
│   │   └── instructional-design.ts
│   └── prisma.ts       # Prisma client
├── prisma/             # Database schema
│   └── schema.prisma
└── ...
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- API keys for AI providers (optional but recommended):
  - OpenAI API key
  - Anthropic API key

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/edutex"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secret-key"

# OAuth Providers (get from provider consoles)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI Providers
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

### 3. Database Setup

Install dependencies:

```bash
npm install
```

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The Prisma schema includes models for:

### Authentication
- **User** - User accounts with OAuth support
- **Account** - OAuth account connections
- **Session** - User sessions
- **VerificationToken** - Email verification

### Core EduTex Models
- **Workspace** - Top-level container (e.g., client or program)
- **WorkspaceMember** - User roles within workspace
- **Project** - Training initiative within workspace
- **Page** - Document surface for analysis/design
- **Block** - Content blocks within pages
- **Task** - Work items with status tracking
- **Objective** - Learning objectives with Bloom's Taxonomy
- **Deliverable** - Project deliverables

### Enums
- **WorkspaceRole**: ADMINISTRATOR, MANAGER, DESIGNER, FACILITATOR, SME
- **PageType**: NEEDS_ANALYSIS, TASK_ANALYSIS, LEARNING_OBJECTIVES, etc.
- **BlockType**: PARAGRAPH, HEADING, LIST, CALLOUT, LEARNING_OBJECTIVE, etc.
- **BloomLevel**: REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE
- **TaskStatus**, **Priority**, **DeliverableType**, **DeliverableStatus**

## AI Features

The AI abstraction layer supports both OpenAI and Anthropic:

### Available Functions

```typescript
import {
  convertNotesToTaskList,
  generateLearningObjectives,
  suggestAssessments,
  analyzeNeedsAnalysis,
  generateExecutiveSummary
} from '@/lib/ai/instructional-design';

// Convert SME notes to structured tasks
const tasks = await convertNotesToTaskList(notes);

// Generate learning objectives
const objectives = await generateLearningObjectives(performanceDescription);

// Get assessment ideas
const assessments = await suggestAssessments(objective, bloomLevel);

// Analyze needs analysis
const analysis = await analyzeNeedsAnalysis(content);

// Generate executive summary
const summary = await generateExecutiveSummary(projectData);
```

### Provider Selection

The system automatically uses:
- **OpenAI** - For general content generation and extraction
- **Anthropic** - For long-form analysis and structured outputs

You can manually specify a provider:

```typescript
const response = await aiService.complete({
  provider: 'openai', // or 'anthropic'
  messages: [...],
});
```

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

### GitHub OAuth

1. Go to [GitHub Settings > Developer Settings](https://github.com/settings/developers)
2. Create New OAuth App
3. Set Homepage URL: `http://localhost:3000`
4. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Secret to `.env`

## Development Guidelines

### Instructional Design Focus

EduTex is purpose-built for instructional designers:

- All features should support ID workflows (analysis, design, development)
- Templates and structures follow ADDIE/SAM methodologies
- AI features understand learning theory and Bloom's Taxonomy
- UI is minimalist and productivity-focused, not a general note-taking app

### Code Style

- Use TypeScript strict mode
- Follow Next.js App Router conventions
- Keep components small and focused
- Use Tailwind for all styling
- Document AI prompts thoroughly

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Database Hosting

Recommended PostgreSQL providers:
- [Neon](https://neon.tech) - Serverless Postgres
- [Supabase](https://supabase.com) - Includes auth and storage
- [Railway](https://railway.app) - Full stack deployment

## Contributing

This project follows the EduTex PRD design document. Before making changes:

1. Review the PRD in `docs/edutex_prd.md`
2. Ensure changes align with instructional design best practices
3. Test with realistic ID scenarios
4. Document new AI features and prompts

## License

Private project - All rights reserved

## Support

For issues and questions, refer to project documentation in `/docs`.
