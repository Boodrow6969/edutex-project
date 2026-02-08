# EduTex Setup Guide

This guide will help you get the EduTex instructional design workspace up and running.

## Current Implementation Status

### ✅ Phase 1: Foundation (COMPLETE)

The core foundation of EduTex has been successfully implemented:

1. **Next.js Application** - Modern React framework with TypeScript
2. **Prisma ORM + PostgreSQL** - Comprehensive database schema for all core models
3. **Authentication (NextAuth.js)** - OAuth integration ready (Google, GitHub, Microsoft)
4. **Layout Components** - Sidebar, TopBar, and workspace structure
5. **AI Provider Abstraction** - Pluggable AI layer supporting OpenAI and Anthropic
6. **Block-Based Editor** - Rich content editor with instructional design block types

### Database Schema

The Prisma schema includes complete models for:
- **Authentication**: User, Account, Session, VerificationToken
- **Core**: Workspace, Course, Page, Block
- **Instructional Design**: Learning Objectives, Tasks, Deliverables
- **Roles**: ADMINISTRATOR, MANAGER, DESIGNER, FACILITATOR, SME

### 🚧 Known Issues

**Build Issue with NextAuth + Prisma**: The production build currently fails due to a compatibility issue between NextAuth.js v5 (beta) and the Prisma adapter during static generation. This is a known issue in the NextAuth beta.

**Workarounds**:
1. Use development mode: `npm run dev` (works perfectly)
2. Deploy to Vercel or similar platforms that support dynamic routes
3. Wait for NextAuth.js v5 stable release
4. Or use a simpler auth solution temporarily

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed
- **PostgreSQL database** (local or cloud):
  - Local: PostgreSQL 14+ running on localhost
  - Cloud options: Neon, Supabase, Railway, or AWS RDS
- **(Optional) AI Provider API Keys**:
  - OpenAI API key from https://platform.openai.com
  - Anthropic Claude API key from https://console.anthropic.com

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js, React, TypeScript
- Prisma and @prisma/client
- NextAuth.js and auth adapters
- OpenAI and Anthropic SDKs
- Tailwind CSS and @tailwindcss/typography
- TipTap editor (@tiptap/react, @tiptap/starter-kit, @tiptap/extension-placeholder, @tiptap/pm)

### 2. Configure Environment Variables

Copy the `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your actual values:

```env
# Database - REQUIRED
DATABASE_URL="postgresql://username:password@localhost:5432/edutex"

# NextAuth - REQUIRED
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-random-string-here"

# OAuth Providers - OPTIONAL (but recommended)
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"

GITHUB_CLIENT_ID="your-github-client-id-here"
GITHUB_CLIENT_SECRET="your-github-client-secret-here"

# AI Providers - OPTIONAL (enables AI features)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

**Generating NEXTAUTH_SECRET**:
```bash
# On Unix/Mac:
openssl rand -base64 32

# Or use an online generator:
# https://generate-secret.vercel.app/32
```

### 3. Set Up Database

**Option A: Local PostgreSQL**

1. Install PostgreSQL if not already installed
2. Create a database:
   ```sql
   CREATE DATABASE edutex;
   ```
3. Update DATABASE_URL in .env with your credentials

**Option B: Cloud Database (Recommended for Production)**

Popular options:
- **Neon** (https://neon.tech) - Serverless Postgres, free tier available
- **Supabase** (https://supabase.com) - Includes auth and storage
- **Railway** (https://railway.app) - Easy deployment

Get the connection string from your provider and add to .env

### 4. Generate Prisma Client and Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 5. Set Up OAuth Providers (Optional but Recommended)

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure OAuth consent screen if prompted
6. For "Application type", select "Web application"
7. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
8. Copy Client ID and Client Secret to .env

#### GitHub OAuth Setup

1. Go to [GitHub Settings > Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: "EduTex Local"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy Client ID and generate Client Secret, add both to .env

### 6. Get AI Provider API Keys (Optional)

#### OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key to .env as `OPENAI_API_KEY`

#### Anthropic Claude API Key

1. Visit https://console.anthropic.com/
2. Sign in or create an account
3. Navigate to "API Keys"
4. Create a new key
5. Copy the key to .env as `ANTHROPIC_API_KEY`

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the EduTex landing page!

## Testing the Application

### Test Routes

- `/` - Landing page
- `/workspace` - Main workspace (requires auth if middleware is enabled)
- `/workspace/test-editor` - Block editor test page
- `/auth/signin` - Sign in page
- `/api/auth/signin` - NextAuth sign in endpoint

### Test Block Editor

1. Navigate to http://localhost:3000/workspace/test-editor
2. Click "+ Paragraph", "+ Heading", etc. to add blocks
3. Type content in each block
4. Use the block controls (move up/down, delete)
5. Try the "Learning Objective" block with Bloom's Taxonomy selector
6. Click "Save Page" to see the JSON output

## Project Structure

```
app/
├── app/                          # Next.js App Router
│   ├── api/auth/[...nextauth]/  # NextAuth API route
│   ├── auth/signin/              # Sign in page
│   ├── workspace/                # Main workspace area
│   │   ├── layout.tsx           # Workspace layout with sidebar
│   │   ├── page.tsx             # Workspace home
│   │   └── test-editor/         # Editor test page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── Sidebar.tsx              # Left navigation sidebar
│   ├── TopBar.tsx               # Top navigation bar
│   ├── editor/
│   │   └── BlockEditor.tsx      # Block-based page editor
│   └── tiptap/
│       └── StoryboardEditor.tsx # TipTap storyboard editor
├── lib/                         # Utilities and services
│   ├── prisma.ts                # Prisma client singleton
│   ├── ai/                      # AI abstraction layer
│   │   ├── index.ts             # Main AI service
│   │   ├── types.ts             # TypeScript interfaces
│   │   ├── openai-provider.ts   # OpenAI implementation
│   │   ├── anthropic-provider.ts # Anthropic implementation
│   │   └── instructional-design.ts # ID-specific AI functions
│   ├── tiptap/                  # TipTap editor utilities
│   │   ├── extensions/          # TipTap extension config
│   │   └── sync.ts              # Block <-> TipTap conversion
│   ├── hooks/                   # React hooks
│   │   └── useStoryboardEditor.ts # Storyboard editor hook
│   └── types/                   # TypeScript types
│       └── blocks.ts            # Block content interfaces
├── prisma/
│   └── schema.prisma            # Database schema
├── auth.ts                      # NextAuth configuration
├── auth.config.ts               # NextAuth options
├── middleware.ts                # Next.js middleware
├── .env                         # Environment variables (create this)
├── .env.example                 # Environment template
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind CSS config
└── README.md                    # Project overview
```

## Troubleshooting

### Database Connection Issues

**Error**: "Can't reach database server"
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL is correct
- Check firewall/network settings
- For cloud databases, verify IP whitelist

### Prisma Client Not Generated

**Error**: "Cannot find module '@prisma/client'"
- Run: `npx prisma generate`
- Restart your IDE/terminal
- Check `node_modules/@prisma/client` exists

### OAuth Not Working

**Error**: OAuth callback fails
- Verify callback URLs match exactly (including http vs https)
- Check CLIENT_ID and CLIENT_SECRET are correct
- Ensure OAuth consent screen is configured (Google)
- For GitHub, regenerate secret if issues persist

### AI Features Not Working

**Error**: "No AI provider configured"
- Verify API keys are set in .env
- Check keys don't have extra spaces or quotes
- Restart dev server after adding keys
- Verify API keys are valid (test in provider console)

### Build Fails

**Error**: NextAuth build error
- This is a known issue with NextAuth.js v5 beta
- Use `npm run dev` for development
- Deploy to Vercel/Netlify which handle dynamic routes
- Or wait for NextAuth v5 stable release

## Next Steps

Now that your foundation is set up, you're ready to:

1. **Create sample data** - Use Prisma Studio to add test workspaces and courses
2. **Build workflows** - Implement the needs analysis to objectives workflow
3. **Add templates** - Create course and page templates
4. **Test AI features** - Try the instructional design AI functions
5. **Customize UI** - Adapt the design to your preferences

## Getting Help

- Check the main [README.md](./README.md) for project overview
- Review the [PRD](../docs/edutex_prd.md) for design principles
- Check Prisma docs: https://www.prisma.io/docs
- Next.js docs: https://nextjs.org/docs
- NextAuth docs: https://next-auth.js.org/

## Development Tips

1. **Use Prisma Studio** for database inspection:
   ```bash
   npx prisma studio
   ```

2. **Reset database** if needed:
   ```bash
   npx prisma migrate reset
   ```

3. **Add new models**: Edit `prisma/schema.prisma`, then:
   ```bash
   npx prisma migrate dev --name description_of_changes
   npx prisma generate
   ```

4. **Hot reload**: Changes to most files trigger automatic reload in dev mode

5. **TypeScript errors**: Check `tsconfig.json` and run:
   ```bash
   npm run lint
   ```

Happy building! 🎓
