import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertPostSchema, insertApprovalSchema, insertCommentSchema,
  insertBrandSchema, insertUserSchema, insertAnalyticsSchema 
} from "@shared/schema";
import { 
  generateCaption, suggestHashtags, optimizeForEngagement,
  suggestBestPostingTime, generateContentIdeas, checkBrandTone
} from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Posts routes
  app.get("/api/posts", async (req, res) => {
    try {
      const brandId = req.query.brandId ? parseInt(req.query.brandId as string) : undefined;
      const status = req.query.status as string | undefined;
      const posts = await storage.getPosts(brandId, status);
      res.json(posts);
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
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  app.patch("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const post = await storage.updatePost(id, updates);
      res.json(post);
    } catch (error) {
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
      res.json(posts);
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
      const validatedData = insertBrandSchema.parse(req.body);
      const brand = await storage.createBrand(validatedData);
      res.status(201).json(brand);
    } catch (error) {
      res.status(400).json({ error: "Invalid brand data" });
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
