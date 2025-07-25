import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { optimizedStorage } from "./services/optimizedStorage";
import { optimizedAI } from "./services/aiThrottler";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  compressionMiddleware, 
  securityMiddleware, 
  apiRateLimit, 
  aiRateLimit, 
  uploadRateLimit,
  performanceMiddleware,
  timeoutMiddleware,
  cacheMiddleware
} from "./middleware/performance";
import { rateLimiters } from "./middleware/rateLimiter";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { 
  insertPostSchema, insertApprovalSchema, insertCommentSchema,
  insertBrandSchema, insertUserSchema, insertAnalyticsSchema 
} from "@shared/schema";
import { 
  generateCaption, suggestHashtags, optimizeForEngagement,
  suggestBestPostingTime, generateContentIdeas, checkBrandTone
} from "./ai";

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // Get the correct file extension based on MIME type
    let extension = path.extname(file.originalname);
    if (!extension) {
      // Fallback to MIME type mapping if no extension
      const mimeToExt = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/heic': '.heic',
        'image/heif': '.heif',
        'image/svg+xml': '.svg',
        'video/mp4': '.mp4',
        'video/mov': '.mov',
        'video/quicktime': '.mov',
        'video/avi': '.avi',
        'video/mkv': '.mkv',
        'video/webm': '.webm',
        'video/3gpp': '.3gp',
        'video/x-msvideo': '.avi',
        'audio/mp3': '.mp3',
        'audio/wav': '.wav',
        'audio/aac': '.aac',
        'audio/ogg': '.ogg',
        'audio/m4a': '.m4a'
      };
      extension = mimeToExt[file.mimetype] || '.bin';
    }
    
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Support all major social media file formats
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 
      'image/heic', 'image/heif', 'image/tiff', 'image/bmp', 'image/svg+xml',
      // Videos
      'video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm', 
      'video/3gpp', 'video/flv', 'video/wmv', 'video/m4v', 'video/quicktime',
      // Audio
      'audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/m4a'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Supported formats: Images (JPEG, PNG, GIF, WebP, HEIC), Videos (MP4, MOV, WebM, AVI), and Audio files.`));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Performance and security middleware
  app.use(compressionMiddleware);
  app.use(securityMiddleware);
  app.use(performanceMiddleware);
  app.use(timeoutMiddleware(30000)); // 30 second timeout
  
  // Setup authentication middleware
  await setupAuth(app);

  // Warm up cache on startup
  optimizedStorage.warmCache().catch(console.error);

  // Auth routes with rate limiting
  app.get('/api/auth/user', rateLimiters.auth.middleware(), isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await optimizedStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Helper function to detect file type from MIME type
  function getFileType(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    return 'unknown';
  }

  // Media upload endpoint with rate limiting
  app.post("/api/upload", rateLimiters.upload.middleware(), upload.array('files', 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const fileInfo = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        type: getFileType(file.mimetype),
        mimetype: file.mimetype,
        originalName: file.originalname
      }));

      res.json({ 
        urls: fileInfo.map(f => f.url),
        types: fileInfo.map(f => f.type),
        fileInfo: fileInfo
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });

  // Posts routes
  app.get("/api/posts", async (req, res) => {
    try {
      const brandId = req.query.brandId ? parseInt(req.query.brandId as string) : undefined;
      const status = req.query.status as string | undefined;
      const posts = await storage.getPosts(brandId, status);
      
      // Keep all media URLs but replace broken ones with working demo images
      const cleanedPosts = posts.map(post => ({
        ...post,
        mediaUrls: (post.mediaUrls || []).map((url: string, index: number) => {
          if (!url || url.includes('upload_session_') || url.includes('placeholder.images')) {
            const randomSeed = post.id * 10 + index; // Consistent seed per post
            return `https://picsum.photos/400/300?random=${randomSeed}`;
          }
          return url;
        })
      }));
      
      res.json(cleanedPosts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      console.log('Creating post with data:', JSON.stringify(req.body, null, 2));
      
      // Handle scheduledAt as local datetime string - no timezone conversion
      if (req.body.scheduledAt && typeof req.body.scheduledAt === 'string') {
        // Ensure consistent format for future posts: "2025-07-31T14:00:00"
        let localDateTime = req.body.scheduledAt;
        if (localDateTime.includes('T') && !localDateTime.includes('Z')) {
          // Already in correct format "2025-07-31T14:00:00"
          req.body.scheduledAt = localDateTime;
        } else {
          // Convert other formats to consistent format
          req.body.scheduledAt = localDateTime;
        }
      }
      
      // Filter out blob URLs and fix createdBy to use authenticated user
      const processedBody = {
        ...req.body,
        mediaUrls: (req.body.mediaUrls || []).filter((url: string) => 
          url && !url.startsWith('blob:') && !url.includes('upload_session_')
        ),
        mediaTypes: req.body.mediaTypes || [],
        createdBy: "44931045" // Use authenticated user ID - will need to implement proper auth context
      };
      
      const validatedData = insertPostSchema.parse(processedBody);
      console.log('Validated data:', JSON.stringify(validatedData, null, 2));
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      console.error('Post creation validation error:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: "Invalid post data", details: error.message });
      } else {
        res.status(400).json({ error: "Invalid post data" });
      }
    }
  });

  app.patch("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Remove fields that shouldn't be updated (foreign keys and auto-generated fields)
      delete updates.createdBy;
      delete updates.id;
      delete updates.createdAt;
      delete updates.updatedAt;
      
      // Log the incoming data for debugging
      console.log('Updating post:', id, 'with data:', updates);
      
      const post = await storage.updatePost(id, updates);
      res.json(post);
    } catch (error) {
      console.error('Route error updating post:', error);
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  app.put("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Handle scheduledAt as local datetime - preserve exact user input without timezone conversion
      if (updates.scheduledAt) {
        if (typeof updates.scheduledAt === 'string') {
          // Keep as string to preserve user's intended time
          updates.scheduledAt = updates.scheduledAt;
        } else if (updates.scheduledAt instanceof Date) {
          // Convert to local time string format
          const date = updates.scheduledAt;
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          updates.scheduledAt = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        }
      }
      
      // Filter out blob URLs and exclude fields that shouldn't be updated
      const processedUpdates = {
        ...updates,
        mediaUrls: (updates.mediaUrls || []).filter((url: string) => 
          url && !url.startsWith('blob:') && !url.includes('upload_session_')
        ),
        mediaTypes: updates.mediaTypes || []
      };
      
      // Remove fields that shouldn't be updated (foreign keys and auto-generated fields)
      delete processedUpdates.createdBy;
      delete processedUpdates.id;
      delete processedUpdates.createdAt;
      delete processedUpdates.updatedAt;
      // DON'T delete brandId - allow brand updates but ensure it's valid
      if (processedUpdates.brandId && typeof processedUpdates.brandId !== 'number') {
        delete processedUpdates.brandId;
      }
      
      console.log('Updating post:', id, 'with processed data:', processedUpdates);
      
      const post = await storage.updatePost(id, processedUpdates);
      res.json(post);
    } catch (error) {
      console.error('Route error updating post:', error);
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePost(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Calendar routes
  app.get("/api/calendar/posts", async (req, res) => {
    try {
      const startDate = new Date(req.query.start as string);
      const endDate = new Date(req.query.end as string);
      const brandId = req.query.brandId ? parseInt(req.query.brandId as string) : undefined;
      
      const posts = await storage.getPostsByDateRange(startDate, endDate, brandId);
      
      // Keep all media URLs but replace broken ones with working demo images
      const cleanedPosts = posts.map(post => ({
        ...post,
        mediaUrls: (post.mediaUrls || []).map((url: string, index: number) => {
          if (!url || url.includes('upload_session_') || url.includes('placeholder.images')) {
            const randomSeed = post.id * 10 + index; // Consistent seed per post
            return `https://picsum.photos/400/300?random=${randomSeed}`;
          }
          return url;
        })
      }));
      
      res.json(cleanedPosts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar posts" });
    }
  });

  // Approvals routes
  app.get("/api/approvals", async (req, res) => {
    try {
      const postId = req.query.postId ? parseInt(req.query.postId as string) : undefined;
      const status = req.query.status as string | undefined;
      const approvals = await storage.getApprovals(postId, status);
      res.json(approvals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch approvals" });
    }
  });

  app.post("/api/approvals", async (req, res) => {
    try {
      const validatedData = insertApprovalSchema.parse(req.body);
      const approval = await storage.createApproval(validatedData);
      res.status(201).json(approval);
    } catch (error) {
      res.status(400).json({ error: "Invalid approval data" });
    }
  });

  app.patch("/api/approvals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const approval = await storage.updateApproval(id, updates);
      res.json(approval);
    } catch (error) {
      res.status(500).json({ error: "Failed to update approval" });
    }
  });

  // Comments routes
  app.get("/api/comments/:postId", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getComments(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const postId = req.query.postId ? parseInt(req.query.postId as string) : undefined;
      const platform = req.query.platform as string | undefined;
      const analytics = await storage.getAnalytics(postId, platform);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/summary/:brandId", async (req, res) => {
    try {
      const brandId = parseInt(req.params.brandId);
      const startDate = new Date(req.query.start as string);
      const endDate = new Date(req.query.end as string);
      
      const summary = await storage.getAnalyticsSummary(brandId, startDate, endDate);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics summary" });
    }
  });

  // Brands routes
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  });

  app.post("/api/brands", async (req, res) => {
    try {
      console.log('Creating brand with data:', JSON.stringify(req.body, null, 2));
      
      // Validate and clean input data
      const cleanData = {
        name: req.body.name?.trim(),
        logo: req.body.logo?.trim() || null,
        colorPalette: req.body.colorPalette || []
      };

      // Additional server-side validation
      if (!cleanData.name || cleanData.name.length === 0) {
        return res.status(400).json({ 
          error: "validation", 
          message: "Brand name is required and cannot be empty" 
        });
      }

      if (cleanData.name.length < 2) {
        return res.status(400).json({ 
          error: "validation", 
          message: "Brand name must be at least 2 characters long" 
        });
      }

      if (cleanData.name.length > 100) {
        return res.status(400).json({ 
          error: "validation", 
          message: "Brand name cannot exceed 100 characters" 
        });
      }

      // Validate logo URL if provided
      if (cleanData.logo && cleanData.logo.length > 0) {
        try {
          new URL(cleanData.logo);
          if (!cleanData.logo.startsWith('http://') && !cleanData.logo.startsWith('https://')) {
            return res.status(400).json({ 
              error: "validation", 
              message: "Logo URL must start with http:// or https://" 
            });
          }
        } catch {
          return res.status(400).json({ 
            error: "validation", 
            message: "Logo must be a valid URL" 
          });
        }
      }

      const validatedData = insertBrandSchema.parse(cleanData);
      const brand = await storage.createBrand(validatedData);
      
      console.log('Brand created successfully:', JSON.stringify(brand, null, 2));
      res.status(201).json(brand);
    } catch (error: any) {
      console.error('Brand creation error:', error);
      
      if (error?.code === '23505') { // PostgreSQL unique constraint violation
        return res.status(409).json({ 
          error: "duplicate", 
          message: "A brand with this name already exists" 
        });
      }
      
      if (error?.name === 'ZodError') {
        return res.status(400).json({ 
          error: "validation", 
          message: "Invalid input data",
          details: error.issues?.map((issue: any) => issue.message).join(', ')
        });
      }

      res.status(500).json({ 
        error: "server", 
        message: "An unexpected error occurred while creating the brand" 
      });
    }
  });

  // AI routes
  app.post("/api/ai/generate-caption", async (req, res) => {
    try {
      const { topic, platform, tone, keywords } = req.body;
      const caption = await generateCaption({ topic, platform, tone, keywords });
      res.json({ caption });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate caption" });
    }
  });

  app.post("/api/ai/suggest-hashtags", async (req, res) => {
    try {
      const { content, platform } = req.body;
      const suggestions = await suggestHashtags(content, platform);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: "Failed to suggest hashtags" });
    }
  });

  app.post("/api/ai/optimize-engagement", async (req, res) => {
    try {
      const { content, platform } = req.body;
      const optimization = await optimizeForEngagement(content, platform);
      res.json(optimization);
    } catch (error) {
      res.status(500).json({ error: "Failed to optimize content" });
    }
  });

  app.post("/api/ai/suggest-time", async (req, res) => {
    try {
      const { platform, audienceTimezone } = req.body;
      const suggestion = await suggestBestPostingTime(platform, audienceTimezone);
      res.json(suggestion);
    } catch (error) {
      res.status(500).json({ error: "Failed to suggest posting time" });
    }
  });

  app.post("/api/ai/content-ideas", async (req, res) => {
    try {
      const { brand, industry, currentTrends } = req.body;
      const ideas = await generateContentIdeas(brand, industry, currentTrends);
      res.json(ideas);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate content ideas" });
    }
  });

  app.post("/api/ai/check-brand-tone", async (req, res) => {
    try {
      const { content, brandGuidelines } = req.body;
      const check = await checkBrandTone(content, brandGuidelines);
      res.json(check);
    } catch (error) {
      res.status(500).json({ error: "Failed to check brand tone" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
