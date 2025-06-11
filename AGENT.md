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
