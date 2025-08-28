# Manual Testing Checklist for CueWise

This checklist helps ensure all major features are working correctly after setup.

## 🚀 Before You Start

1. **Ensure server is running**:
   ```bash
   npm run dev
   ```
   Server should start on http://localhost:5000

2. **Open browser** and navigate to http://localhost:5000

## ✅ Basic Functionality Tests

### Navigation & Layout
- [ ] Main dashboard loads without errors
- [ ] Sidebar navigation is visible on desktop
- [ ] Mobile hamburger menu works on small screens
- [ ] All navigation links work:
  - [ ] Dashboard (/)
  - [ ] Calendar (/calendar)
  - [ ] Drafts (/drafts) 
  - [ ] Analytics (/analytics)

### Responsive Design
- [ ] Desktop layout (1200px+): Fixed sidebar, wide layout
- [ ] Tablet layout (768-1200px): Responsive components
- [ ] Mobile layout (<768px): Mobile menu, stacked layout

## 🏢 Brand Management Tests

### Brand Creation
- [ ] Click brand switcher in header
- [ ] Click "Create New Brand" button
- [ ] Fill out brand form:
  - [ ] Brand name (required)
  - [ ] Brand values
  - [ ] Logo URL
  - [ ] Brand colors (color picker)
  - [ ] Vision statement
  - [ ] Mission statement
- [ ] Save brand successfully
- [ ] New brand appears in brand switcher

### Brand Switching
- [ ] Switch between different brands
- [ ] UI updates to show selected brand
- [ ] Data filters by selected brand

## 📝 Post Management Tests

### Post Creation
- [ ] Click "New Post" or "+" button
- [ ] Post editor modal opens
- [ ] Fill out post form:
  - [ ] Content text area
  - [ ] Platform selection (Instagram, Facebook, Twitter, TikTok)
  - [ ] Media upload area
  - [ ] Schedule date/time picker
- [ ] Save as draft
- [ ] Post appears in drafts list

### Media Upload
- [ ] Click media upload area
- [ ] Upload image file
- [ ] Preview displays correctly
- [ ] Multiple media files can be uploaded
- [ ] Remove media files
- [ ] Video files upload (if supported)

### Scheduling
- [ ] Click schedule toggle
- [ ] Select future date
- [ ] Select time
- [ ] Save scheduled post
- [ ] Post appears in calendar on selected date

## 📅 Calendar Tests

### Calendar View
- [ ] Monthly calendar displays
- [ ] Navigate between months
- [ ] Scheduled posts appear on correct dates
- [ ] Click on date shows posts for that day
- [ ] Different post statuses have different colors

### Calendar Filters
- [ ] Filter by brand
- [ ] Filter by status (draft, scheduled, published)
- [ ] Filter by platform
- [ ] Clear filters

## 📊 Analytics Tests

### Dashboard Widgets
- [ ] Analytics page loads
- [ ] Performance metrics display
- [ ] Charts and graphs render
- [ ] Date range selector works
- [ ] Data updates when range changes

### Export Features
- [ ] Export CSV button (if available)
- [ ] Export PDF button (if available)
- [ ] Downloaded files contain expected data

## 🤖 AI Features Tests (Requires OpenAI API)

### Caption Generation
- [ ] In post editor, click "Generate Caption"
- [ ] AI generates relevant caption
- [ ] Can regenerate with different prompts
- [ ] Caption can be edited after generation

### Hashtag Suggestions
- [ ] Click "Suggest Hashtags"
- [ ] Relevant hashtags are suggested
- [ ] Can add/remove suggested hashtags
- [ ] Platform-specific hashtag suggestions

### Posting Time Recommendations
- [ ] AI suggests optimal posting times
- [ ] Different recommendations for different platforms
- [ ] Can apply suggested times to schedule

## 🔄 Approval Workflow Tests

### Creating Approvals
- [ ] Create post and submit for approval
- [ ] Approval request appears in system
- [ ] Email notification sent (if configured)

### Approval Actions
- [ ] Approve a post
- [ ] Reject a post with comments
- [ ] Request changes
- [ ] Status updates correctly

### Comments System
- [ ] Add comment to post
- [ ] Reply to comments
- [ ] Comments display chronologically
- [ ] Real-time updates (if available)

## 📱 Mobile/PWA Tests

### Mobile Layout
- [ ] All features accessible on mobile
- [ ] Touch-friendly button sizes
- [ ] Swipe gestures work
- [ ] No horizontal scrolling

### PWA Features
- [ ] Install app prompt appears
- [ ] App works offline (basic functionality)
- [ ] Service worker caching works
- [ ] App manifest loads correctly

## ⚠️ Error Handling Tests

### Network Issues
- [ ] Disable network and test offline functionality
- [ ] Error messages display appropriately
- [ ] App recovers when connection restored

### Form Validation
- [ ] Try submitting empty required fields
- [ ] Validation messages appear
- [ ] Invalid data formats rejected
- [ ] File size/type restrictions work

### API Errors
- [ ] Test with invalid API keys
- [ ] Appropriate error messages shown
- [ ] App doesn't crash on API failures

## 🚨 Common Issues to Check

### Performance
- [ ] Pages load in under 3 seconds
- [ ] No memory leaks during extended use
- [ ] Image loading doesn't block UI
- [ ] Smooth animations and transitions

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast sufficient
- [ ] Focus indicators visible

### Browser Compatibility
- [ ] Works in Chrome/Chromium
- [ ] Works in Firefox
- [ ] Works in Safari (if available)
- [ ] Works in Edge (if available)

## 📝 Test Results Template

Copy this template for documenting your test results:

```
# Test Results - [Date]

## Environment
- Browser: 
- Screen size: 
- Database: [Connected/Mock]
- OpenAI API: [Configured/Not configured]

## Passed Tests
✅ Navigation and layout
✅ Brand management
✅ Post creation
- Add more as you test...

## Failed Tests
❌ Issue description
❌ Steps to reproduce
- Error messages
- Screenshots

## Performance Notes
- Page load times: 
- Memory usage: 
- API response times: 

## Recommendations
- Priority fixes needed
- Enhancement suggestions
```

## 🎯 Success Criteria

The app is considered working correctly if:

1. **Core Functions Work**: Create brands, create posts, schedule content
2. **UI is Responsive**: Works on desktop and mobile
3. **Data Persists**: Information saves and loads correctly
4. **No Critical Errors**: No app crashes or broken core features
5. **AI Features**: Work when properly configured
6. **Performance**: Reasonable load times and smooth interactions

## 🔧 If Tests Fail

1. **Check Console**: Look for JavaScript errors in browser dev tools
2. **Check Network**: Ensure API calls are working in Network tab
3. **Check Server Logs**: Look at terminal where dev server is running
4. **Validate Setup**: Run `npm run validate` again
5. **Check Documentation**: Refer to README.md and TESTING.md
6. **Report Issues**: Document problems with steps to reproduce