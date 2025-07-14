CueWise - Social Media Management Platform

## Overview

CueWise is a web-based social media management platform with AI-powered content creation and analytics. The application enables users to create, schedule, and manage social media posts across multiple platforms (Instagram, Facebook, TikTok, Twitter) with collaborative approval workflows and comprehensive analytics.

## Recent Changes (July 2025)

✓ **Video Thumbnail Display Fixed** - Complete video thumbnail implementation across all components
  - Fixed post editor modal to display actual video thumbnails instead of generic icons
  - Updated calendar components to use MediaThumbnail component for proper video display
  - Fixed post card component to show actual media thumbnails in dashboard
  - Removed "Failed to load" fallback text from all media displays
  - Video files now display actual video frames with play button overlay
  - All preview sections (Instagram, Facebook, Twitter, TikTok) now show proper video thumbnails

✓ **TypeScript Warnings Fixed** - Resolved Drizzle ORM compatibility issues
  - Fixed createBrand and createPost methods to use array syntax for .values()
  - Updated database query methods to use proper .execute() calls
  - Corrected authentication schema to match database structure
  - All TypeScript compilation warnings now resolved

✓ **Authentication Flow Restored** - Fixed user authentication and database integration
  - Updated users table schema to use 'name' field instead of separate first/last names
  - Fixed user upsert operations for Replit Auth integration
  - Database queries now working properly with authenticated users

✓ **Native Mobile Media Player Integration** - Enhanced mobile UX with device-native playback
  - Implemented automatic mobile device detection using screen width and user agent
  - Video and audio files now open in native mobile media players on touch devices
  - Images continue to use custom lightbox modal for consistent experience
  - Download functionality preserved with proper file extension detection
  - Desktop users still get full-featured custom media player with navigation

✓ **Multi-Media File Upload System Fixed** - Complete support for all social media formats
  - Fixed critical bug where video files were saved with .jpg extensions
  - Updated multer configuration to properly handle MP4, MOV, WebM, AVI video formats
  - Added support for audio files (MP3, WAV, AAC, OGG) and extended image formats
  - Increased file size limit to 100MB for video content
  - Enhanced media thumbnail component with video preview and play icons
  - Fixed filename logic to preserve correct file extensions based on MIME types

✓ **Calendar Date Range Issues Resolved** - Fixed posts not appearing on 31st days
  - Corrected calendar month-end date calculation to include full last day (23:59:59)
  - Fixed date format inconsistency between old and new post formats
  - Updated server-side date filtering to handle both "2025-07-24 08:00:00" and "2025-07-31T14:00:00" formats
  - All posts scheduled for 31st days now display correctly in calendar

✓ **Critical Timezone Fix Applied** - Fixed date scheduling bug affecting calendar posts
  - Replaced hardcoded UTC+8 timezone with user's local timezone
  - Fixed manual date parsing to prevent timezone conversion issues
  - Corrected scheduled date display in post editor modal
  - Posts now save with correct scheduled times matching user input

✓ **React Infinite Loop Bug Fixed** - Resolved app startup failures
  - Fixed infinite loop in PostEditorModal component's useEffect
  - Improved blob URL cleanup logic to prevent memory leaks
  - App now starts consistently without React warnings

✓ **Theme System Removal Complete** - Removed complex theme customization to fix text display issues
  - Simplified to single, consistent light theme design
  - Removed theme provider, customizer, and picker components
  - Fixed localStorage character encoding errors
  - Cleaned up all dark mode and custom color references

✓ **Multi-Brand Management System Complete** - Full workspace isolation implemented
  - Brand switcher component with dropdown interface in sidebar
  - Brand creation modal with form validation and error handling
  - Zustand state management for persistent brand selection
  - Complete data filtering by selected brand across all components
  - Separate workspaces for posts, calendar, analytics per brand

✓ **Mobile-First Enhancement Complete** - Comprehensive mobile optimizations implemented
  - Touch-optimized calendar with swipe gestures for month navigation
  - Minimum 44px touch targets for all interactive elements
  - Mobile floating action buttons for quick post creation
  - Enhanced CSS for smooth touch interactions and feedback
  - PWA manifest configuration for app-like installation
  - Safe area support for mobile devices with notches/rounded corners
  - Mobile keyboard awareness with env(keyboard-inset-height) support
  - Responsive Note page that adapts to mobile screen sizes (max 90vw)
  - Rich text editor tooltips with z-index 120 to appear above modal layers

✓ **Database Integration Active** - PostgreSQL with sample data populated
  - Drizzle ORM with type-safe queries operational
  - Sample brands, users, and posts loaded for demonstration
  - Real-time data display in calendar and dashboard components

✓ **AI Features Operational** - OpenAI integration fully functional
  - Content generation and optimization working
  - Hashtag suggestions and engagement optimization available
  - Posting time recommendations active

## User Preferences

Preferred communication style: Simple, everyday language.
Theme preferences: Remove theme/color customization options - causes text display issues, keep simple consistent design.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Mobile-First Design**: Progressive Web App (PWA) with responsive design

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

## Key Components

### Core Domain Models
- **Users**: Role-based (creator, editor, approver, admin) with authentication
- **Brands**: Multi-brand support with visual identity management
- **Posts**: Content with multi-platform publishing and status tracking
- **Approvals**: Collaborative workflow with comments and status updates
- **Analytics**: Performance tracking across platforms
- **Platforms**: Social media platform integrations and credentials

### Authentication & Authorization
- **Role-Based Access**: Four user roles with different permissions
- **Session Management**: Express sessions with PostgreSQL storage
- **Route Protection**: API endpoints protected by role-based middleware

### AI Integration
- **Content Generation**: OpenAI GPT-4o for caption generation
- **Hashtag Suggestions**: AI-powered hashtag recommendations
- **Content Optimization**: Engagement optimization suggestions
- **Posting Time Optimization**: AI-suggested optimal posting times

### PWA Features
- **Service Worker**: Offline functionality with caching strategies
- **App Manifest**: Native app-like installation and experience
- **Mobile Navigation**: Touch-optimized interface with bottom navigation
- **Responsive Design**: Adaptive layout for mobile and desktop

## Data Flow

### Content Creation Flow
1. User creates post draft with content and media
2. AI suggestions for captions, hashtags, and timing
3. Multi-platform content adaptation and preview
4. Save as draft or submit for approval

### Approval Workflow
1. Post submitted for approval by creator
2. Approvers receive notifications
3. Comment threads for feedback and revisions
4. Approve/reject with status updates
5. Approved posts ready for scheduling

### Publishing Flow
1. Schedule posts with optimal timing suggestions
2. Platform-specific API integration for publishing
3. Real-time status updates and notifications
4. Analytics collection post-publication

### Analytics Pipeline
1. Data collection from platform APIs
2. Aggregation and calculation of metrics
3. Dashboard visualization with charts
4. Export functionality for reporting

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **AI Services**: OpenAI API for content generation
- **Build Tools**: Vite for development and bundling
- **WebSocket**: For real-time notifications (via Neon)

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

## Deployment Strategy

### Development Environment
- **Replit Integration**: Native Replit development support
- **Hot Module Replacement**: Vite HMR for fast development
- **TypeScript Checking**: Real-time type validation
- **Environment Variables**: Secure credential management

### Production Build
- **Client Build**: Vite production build with optimization
- **Server Build**: ESBuild for Node.js bundle creation
- **Static Assets**: Optimized and cached public assets
- **Service Worker**: Cached for offline functionality

### Database Management
- **Schema Synchronization**: Drizzle Kit push for development
- **Migration Strategy**: Version-controlled schema changes
- **Connection Pooling**: Neon serverless connection management
- **Backup Strategy**: Automated PostgreSQL backups

### Performance Optimization
- **Code Splitting**: Route-based and component-based splitting
- **Image Optimization**: Unsplash integration with optimized sizing
- **Caching Strategy**: Service worker with cache-first/network-first patterns
- **Bundle Analysis**: Tree shaking and dead code elimination

The application follows a modern full-stack architecture with emphasis on developer experience, type safety, and mobile-first design principles.