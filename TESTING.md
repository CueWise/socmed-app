# Testing Guide for CueWise Social Media App

This guide provides comprehensive instructions for testing and running the CueWise social media management application.

## 🚀 Quick Setup for Testing

### Option 1: Full Setup (Recommended)

1. **Get a Free Neon Database**:
   - Visit [Neon Console](https://console.neon.tech)
   - Create a free account
   - Create a new project
   - Copy the connection string from the dashboard

2. **Get OpenAI API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an API key
   - You'll need $5+ credits for testing AI features

3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual database URL and OpenAI key
   ```

4. **Initialize database and run**:
   ```bash
   npm install
   npm run db:push
   npm run dev
   ```

### Option 2: Local Testing (Advanced)

1. **Install PostgreSQL locally**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql
   
   # Windows - Download from postgresql.org
   ```

2. **Create test database**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE socmed_test;
   CREATE USER test_user WITH PASSWORD 'test_password';
   GRANT ALL PRIVILEGES ON DATABASE socmed_test TO test_user;
   \q
   ```

3. **Update .env**:
   ```env
   DATABASE_URL=postgresql://test_user:test_password@localhost:5432/socmed_test
   OPENAI_API_KEY=your_openai_key_here
   PORT=5000
   NODE_ENV=development
   ```

### Option 3: Demo Mode (Limited Features)

*Note: This option would require code modifications to bypass database requirements*

For immediate testing without external dependencies, you could modify the code to run in demo mode.

## 🧪 Testing Scenarios

### 1. Frontend Testing

Access the application at `http://localhost:5000` and test:

#### Navigation Testing:
- [ ] Main Dashboard loads correctly
- [ ] Calendar page (`/calendar`) displays
- [ ] Drafts page (`/drafts`) displays
- [ ] Analytics page (`/analytics`) displays
- [ ] Mobile responsive design works

#### Brand Management:
- [ ] Create a new brand
- [ ] Upload brand logo
- [ ] Set brand colors and guidelines
- [ ] Switch between brands

#### Post Creation:
- [ ] Create new post with text content
- [ ] Upload images and videos
- [ ] Select multiple social media platforms
- [ ] Use AI caption generation
- [ ] Use AI hashtag suggestions
- [ ] Schedule post for future date

#### Calendar Features:
- [ ] View posts in calendar
- [ ] Filter by brand
- [ ] Filter by status (draft, scheduled, published)
- [ ] Edit scheduled posts

### 2. API Testing

Test backend functionality directly:

```bash
# Health check
curl http://localhost:5000/api/posts

# Create brand
curl -X POST http://localhost:5000/api/brands \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Brand",
    "values": "Innovation, Quality",
    "logo": "https://example.com/logo.png"
  }'

# Create post
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test post content",
    "platforms": ["instagram", "twitter"],
    "brandId": 1,
    "status": "draft"
  }'

# AI Caption Generation
curl -X POST http://localhost:5000/api/ai/generate-caption \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Coffee morning",
    "platform": "instagram",
    "tone": "friendly"
  }'
```

### 3. Performance Testing

#### Load Testing:
```bash
# Install Apache Bench (if not available)
# Ubuntu: sudo apt-get install apache2-utils
# macOS: brew install apache-bench

# Test basic load
ab -n 100 -c 10 http://localhost:5000/

# Test API endpoint load
ab -n 50 -c 5 http://localhost:5000/api/posts
```

#### Memory and CPU Monitoring:
```bash
# Monitor server performance
top -p $(pgrep node)

# Check memory usage
ps aux | grep node
```

## 🐛 Common Issues & Solutions

### Database Issues

**Problem**: `DATABASE_URL must be set`
```bash
# Solution: Check .env file exists and has correct DATABASE_URL
ls -la .env
cat .env | grep DATABASE_URL
```

**Problem**: Database connection refused
```bash
# Solution: Verify database is running and accessible
# For local PostgreSQL:
sudo systemctl status postgresql
# For Neon: Check console.neon.tech for status
```

### OpenAI API Issues

**Problem**: AI features not working
```bash
# Check API key is set
cat .env | grep OPENAI_API_KEY

# Test API key manually
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Build Issues

**Problem**: TypeScript compilation errors
```bash
# Check specific errors
npm run check

# These are often non-blocking warnings
# Try running anyway:
npm run dev
```

**Problem**: Port already in use
```bash
# Find process using port
lsof -i :5000

# Kill process or change port in .env
```

### Frontend Issues

**Problem**: Page not loading
- Check browser console for errors
- Verify server is running on correct port
- Check network requests in browser dev tools

**Problem**: Media uploads failing
- Check `public/uploads` directory exists
- Verify file permissions
- Check file size limits

## 📊 Success Metrics

After setup, you should be able to:

### ✅ Basic Functionality
- [ ] Server starts without errors
- [ ] Frontend loads in browser
- [ ] API endpoints respond correctly
- [ ] Database queries work

### ✅ Core Features
- [ ] Create and manage brands
- [ ] Create and edit posts
- [ ] Upload and manage media files
- [ ] Schedule posts for future dates
- [ ] View calendar with scheduled content

### ✅ AI Features (if OpenAI configured)
- [ ] Generate captions for posts
- [ ] Suggest relevant hashtags
- [ ] Get posting time recommendations
- [ ] Brand tone consistency checking

### ✅ Responsive Design
- [ ] Mobile layout works correctly
- [ ] Desktop layout with sidebar
- [ ] Touch-friendly interface
- [ ] PWA installation works

## 🔧 Advanced Testing

### Database Schema Testing
```bash
# Test schema changes
npm run db:push

# Check database structure
psql $DATABASE_URL
\dt  # List tables
\d posts  # Describe posts table
```

### Integration Testing
```bash
# Test complete user workflow
# 1. Create brand
# 2. Create post
# 3. Schedule post
# 4. View in calendar
# 5. Update status
```

### Security Testing
- [ ] API rate limiting works
- [ ] Input validation prevents SQL injection
- [ ] File upload restrictions work
- [ ] CORS policies configured correctly

## 📝 Test Documentation

Document your test results:

```markdown
# Test Results - [Date]

## Environment
- Node.js version: 
- Database: 
- OpenAI API: [Configured/Not Configured]

## Passed Tests
- [ ] Server startup
- [ ] Basic navigation
- [ ] Brand creation
- [ ] Post creation
- [ ] Media upload

## Failed Tests
- [ ] Issue description and error messages

## Performance
- Page load time: 
- API response time: 
- Memory usage: 
```

## 🎯 Next Steps

After successful testing:
1. Set up production environment
2. Configure social media API integrations
3. Set up monitoring and logging
4. Implement proper authentication
5. Add automated tests
6. Set up CI/CD pipeline