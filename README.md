# CueWise - Social Media Management Platform

CueWise is a comprehensive social media management platform that enables users to create, schedule, and manage social media posts across multiple platforms (Instagram, Facebook, TikTok, Twitter). It features AI-powered content creation, collaborative approval workflows, and comprehensive analytics.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18+ (recommended v20+)
- **npm**: v8+ (comes with Node.js)
- **PostgreSQL Database**: Neon serverless database (or local PostgreSQL)
- **OpenAI API Key**: For AI-powered content generation

### Environment Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/CueWise/socmed-app.git
   cd socmed-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database Configuration (Required)
   DATABASE_URL=postgresql://username:password@host:port/database_name

   # OpenAI API Configuration (Required for AI features)
   OPENAI_API_KEY=your_openai_api_key_here

   # Server Configuration (Optional)
   PORT=5000
   NODE_ENV=development

   # Redis Configuration (Optional - for caching in production)
   REDIS_URL=redis://localhost:6379
   ```

4. **Set up the database**:
   ```bash
   npm run db:push
   ```

## 🏃‍♂️ Running the Application

### Development Mode

Start the development server with hot reloading:
```bash
npm run dev
```

The application will be available at:
- **Frontend & API**: http://localhost:5000 (or your specified PORT)

### Production Mode

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

## 🧪 Testing the Application

### Quick Testing Options

Choose the testing approach that best fits your setup:

#### Option 1: Full Setup Testing (Recommended)
1. **Complete setup** with real database and OpenAI API
2. **Validate setup**: `npm run validate`
3. **Start development**: `npm run dev`
4. **Test all features** including AI capabilities

#### Option 2: Quick Demo Testing
1. **Run demo mode**: `npm run demo`
2. **Test UI components** without external dependencies
3. **Note**: Database and AI features won't work

#### Option 3: Manual Setup Validation
1. **Install dependencies**: `npm install`
2. **Validate environment**: `npm run validate`
3. **Fix any issues** reported by validator
4. **Start application**: `npm run dev`

### Comprehensive Testing

#### 1. Setup Validation
```bash
# Validate your entire setup
npm run validate

# Quick setup if starting fresh
npm run setup
```

#### 2. Manual UI Testing
Follow the comprehensive checklist in `MANUAL_TESTING.md`:
- ✅ Navigation and layout
- ✅ Brand management
- ✅ Post creation and editing
- ✅ Calendar functionality
- ✅ Media upload
- ✅ AI features (if configured)
- ✅ Mobile responsiveness

#### 3. API Endpoint Testing
```bash
# Test health check
curl http://localhost:5000/api/posts

# Test brand creation
curl -X POST http://localhost:5000/api/brands \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Brand","values":"Innovation, Quality"}'
```

#### 4. Build Testing
```bash
# Test production build
npm run build

# Start production server (after build)
npm start
```

### Testing Documentation

- **TESTING.md** - Comprehensive testing guide with setup options
- **MANUAL_TESTING.md** - Step-by-step UI testing checklist
- **validate-setup.js** - Automated setup validation tool

*Note: Some TypeScript errors may appear during `npm run check` but don't prevent the application from running.*

## 🏗️ Architecture Overview

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query + Zustand
- **Routing**: Wouter

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4o
- **Caching**: Redis (optional, in production)

### Key Features
- **Multi-brand Management**: Support for multiple brands with brand-specific content
- **AI-Powered Content**: Caption generation, hashtag suggestions, optimal posting times
- **Collaborative Workflow**: Approval system for team collaboration
- **PWA Features**: Offline functionality, mobile-responsive design
- **Analytics Dashboard**: Comprehensive performance tracking

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   └── index.html         # Main HTML template
├── server/                # Backend Express application
│   ├── index.ts          # Main server entry point
│   ├── routes.ts         # API routes
│   ├── db.ts             # Database connection
│   ├── ai.ts             # OpenAI integration
│   └── storage.ts        # Data access layer
├── shared/               # Shared TypeScript schemas
│   └── schema.ts         # Database schemas and types
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🐛 Troubleshooting

### Quick Diagnostics
```bash
# Run complete setup validation
npm run validate

# Check TypeScript errors (non-blocking)
npm run check

# Test build process
npm run build
```

### Common Issues

#### 1. Database Connection Error
**Error**: `DATABASE_URL must be set`
```bash
# Solution: Check .env file
ls -la .env
cat .env | grep DATABASE_URL

# Get free database at https://neon.tech
# Update .env with your database URL
```

#### 2. OpenAI API Issues
**Error**: AI features not working
```bash
# Check API key configuration
cat .env | grep OPENAI_API_KEY

# Test API key validity
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

#### 3. Build/TypeScript Errors
**Error**: Compilation fails
```bash
# Check specific errors
npm run check

# Many errors are warnings and won't prevent running
npm run dev  # Try running anyway
```

#### 4. Port Conflicts
**Error**: `EADDRINUSE: address already in use`
```bash
# Find process using port
lsof -i :5000

# Change port in .env
echo "PORT=3000" >> .env
```

#### 5. Dependencies Issues
**Error**: Module not found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

1. **Check validation**: `npm run validate`
2. **Review setup guides**: `TESTING.md` and `MANUAL_TESTING.md`
3. **Check console errors**: Browser dev tools and terminal output
4. **Verify environment**: Ensure all required environment variables are set

### Development Tips

- **Database Schema Changes**: Run `npm run db:push` after modifying schema
- **API Testing**: Use browser dev tools Network tab to debug API calls  
- **Mobile Testing**: Use browser responsive design mode
- **Performance**: Check Memory tab in dev tools for memory leaks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run check` to ensure no type errors
5. Test your changes thoroughly
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.