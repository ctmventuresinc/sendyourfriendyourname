# AGENT.md - Development Guide for sendyourfriendyourname

## Commands
- `npm run dev` - Start development server (with Turbopack)
- `npm run build` - Build production app 
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- No test scripts configured yet

## Architecture
- Next.js 15.3.3 App Router application with TypeScript
- Frontend-only React app using React 19
- Static assets in `public/`
- App structure follows Next.js App Router conventions in `app/` directory
- CSS modules for styling (`page.module.css`)
- Uses Geist font via next/font optimization

## Code Style
- TypeScript with strict mode enabled
- Import aliases: `@/*` maps to project root
- Named imports from Next.js (`import Image from "next/image"`)
- CSS modules for component styling
- Function components with default exports
- ESLint configuration via Next.js defaults
- Target ES2017 with modern browser support
- JSX preserved for Next.js compilation

## Game Development Notes
- Always ask before implementing new game mechanics or changing existing ones
- Skipping questions is part of the game - players should be able to skip all questions and get zero points
- This is intentional game design, not a bug to fix
- **IMPORTANT**: The app has two user flows - main game creation (`app/page.tsx`) and friend challenge (`app/[id]/page.tsx`)
- Any new features, UI components, or game mechanics MUST be shared between both flows using reusable components
- Never duplicate code between the two pages - create shared components in `app/components/` instead
