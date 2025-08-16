## Overview

CueWise is a web-based social media management platform that enables users to create, schedule, and manage social media posts across multiple platforms (Instagram, Facebook, TikTok, Twitter). It features AI-powered content creation and analytics, collaborative approval workflows, and comprehensive analytics. The platform aims to provide a professional desktop experience while maintaining a robust mobile design, offering a sophisticated solution for social media content management.

## User Preferences

Preferred communication style: Simple, everyday language.
Theme preferences: Remove theme/color customization options - causes text display issues, keep simple consistent design.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Design Principles**: Mobile-First Progressive Web App (PWA) with responsive design, including a sophisticated desktop layout with a fixed-width sidebar, card-based dashboard, and enhanced navigation.
- **UI/UX Decisions**: Rebranding to CueWise, dynamic brand logo display, enhanced media upload loading effects with spinners and placeholders, immediate UI updates for media detachment, comprehensive video thumbnail display across all components, and a two-column desktop post editor modal with interactive media previews. Simplified to a single, consistent light theme.

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling
- **File Structure**: Monorepo with shared schema between client and server

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM with type-safe queries
- **Schema**: Shared TypeScript schema definitions using Drizzle and Zod
- **Migrations**: Drizzle Kit for database migrations

### Key Features and Implementations
- **Core Domain Models**: Users (role-based), Brands (multi-brand support), Posts (multi-platform), Approvals (collaborative workflow), Analytics, and Platforms.
- **Authentication & Authorization**: Simplified demo authentication (Replit Auth removed for easier deployment).
- **AI Integration**: OpenAI GPT-4o for content generation, hashtag suggestions, content optimization, and posting time recommendations.
- **PWA Features**: Service Worker for offline functionality, App Manifest for native-like installation, touch-optimized mobile navigation, and responsive design.
- **Multi-Brand Management**: Brand switcher component, brand creation modal, and Zustand for persistent brand selection and data filtering by selected brand across components.
- **Performance Optimization**: Database query optimization, React component memoization, calendar performance enhancements, real-time cache management, database indexing, and media loading optimization.
- **Date & Time Handling**: Critical timezone fixes, calendar date range issue resolution, and proper handling of scheduled times to match user input.
- **Media Management**: Robust multi-media file upload system supporting various formats (video, audio, extended image formats) with increased file size limits, and native mobile media player integration.

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **AI Services**: OpenAI API
- **Build Tools**: Vite
- **WebSocket**: (via Neon)

### Social Media Platforms
- **Meta Business Suite API**: Instagram and Facebook publishing
- **TikTok Business API**: TikTok content management
- **Twitter API**: Tweet scheduling and analytics
- **Platform OAuth**: Authentication flows for social accounts

### UI and Styling
- **Shadcn/ui**: Pre-built accessible components
- **Radix UI**: Unstyled component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library