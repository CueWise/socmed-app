import { users, brands, posts, approvals, comments, analytics, brandAssets,
         type User, type InsertUser, type UpsertUser, type Brand, type InsertBrand, 
         type Post, type InsertPost, type Approval, type InsertApproval,
         type Comment, type InsertComment, type Analytics, type InsertAnalytics,
         type BrandAsset, type InsertBrandAsset } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql, or, isNull } from "drizzle-orm";

export interface IStorage {
  // Users (Required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Brands
  getBrands(): Promise<Brand[]>;
  getBrand(id: number): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;

  // Posts
  getPosts(brandId?: number, status?: string): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, updates: Partial<Post>): Promise<Post>;
  deletePost(id: number): Promise<void>;
  getPostsByDateRange(start: Date, end: Date, brandId?: number): Promise<Post[]>;

  // Approvals
  getApprovals(postId?: number, status?: string): Promise<Approval[]>;
  createApproval(approval: InsertApproval): Promise<Approval>;
  updateApproval(id: number, updates: Partial<Approval>): Promise<Approval>;

  // Comments
  getComments(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Analytics
  getAnalytics(postId?: number, platform?: string): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalyticsSummary(brandId: number, startDate: Date, endDate: Date): Promise<{
    totalReach: number;
    totalEngagement: number;
    totalPosts: number;
    totalViews: number;
  }>;

  // Brand Assets
  getBrandAssets(brandId: number): Promise<BrandAsset[]>;
  createBrandAsset(asset: InsertBrandAsset): Promise<BrandAsset>;

  // Brand management
  updateBrand(id: number, updates: Partial<Brand>): Promise<Brand>;
  deleteBrand(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users (Required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Brands
  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands).orderBy(desc(brands.createdAt));
  }

  async getBrand(id: number): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand || undefined;
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [newBrand] = await db.insert(brands).values([brand]).returning();
    return newBrand;
  }

  // Posts
  async getPosts(brandId?: number, status?: string): Promise<Post[]> {
    let query = db.select().from(posts);
    
    const conditions = [];
    if (brandId) conditions.push(eq(posts.brandId, brandId));
    if (status) conditions.push(eq(posts.status, status as any));
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(posts.createdAt));
    }
    
    return await query.orderBy(desc(posts.createdAt));
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values([post]).returning();
    return newPost;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post> {
    try {
      // Ensure scheduledAt is a proper Date object if provided
      const processedUpdates = { ...updates };
      if (processedUpdates.scheduledAt && typeof processedUpdates.scheduledAt === 'string') {
        processedUpdates.scheduledAt = processedUpdates.scheduledAt;
      }
      
      const [updatedPost] = await db
        .update(posts)
        .set({ ...processedUpdates, updatedAt: new Date() })
        .where(eq(posts.id, id))
        .returning();
      
      if (!updatedPost) {
        throw new Error(`Post with id ${id} not found`);
      }
      
      return updatedPost;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getPostsByDateRange(start: Date, end: Date, brandId?: number): Promise<Post[]> {
    console.log('Calendar query - Start:', start.toISOString(), 'End:', end.toISOString(), 'BrandId:', brandId);
    
    // Convert dates to local date strings for text comparison
    const startDateString = start.toISOString().split('T')[0]; // "2025-07-01"
    const endDateString = end.toISOString().split('T')[0]; // "2025-07-31"
    
    console.log('Converted date strings - Start:', startDateString, 'End:', endDateString);
    
    // Get all posts and filter in JavaScript to handle both date formats
    let query = db.select().from(posts);
    
    const conditions = [];
    if (brandId) {
      conditions.push(eq(posts.brandId, brandId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const allPosts = await query.execute();
    
    // Filter posts based on scheduledAt date range, handling both formats
    const filteredPosts = allPosts.filter(post => {
      if (!post.scheduledAt) {
        // Include drafts without dates if created recently
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return post.createdAt >= weekAgo;
      }
      
      // Extract date part from scheduledAt regardless of format
      let postDateStr = '';
      if (post.scheduledAt.includes('T')) {
        // Format: "2025-07-31T14:00:00"
        postDateStr = post.scheduledAt.split('T')[0];
      } else if (post.scheduledAt.includes(' ')) {
        // Format: "2025-07-24 08:00:00"
        postDateStr = post.scheduledAt.split(' ')[0];
      } else {
        // Format: "2025-07-24"
        postDateStr = post.scheduledAt;
      }
      
      // Check if post date is within range
      return postDateStr >= startDateString && postDateStr <= endDateString;
    });
    
    console.log('Calendar query result:', filteredPosts.length, 'posts found');
    return filteredPosts;
  }

  // Approvals
  async getApprovals(postId?: number, status?: string): Promise<Approval[]> {
    let query = db.select().from(approvals);
    
    const conditions = [];
    if (postId) conditions.push(eq(approvals.postId, postId));
    if (status) conditions.push(eq(approvals.status, status as any));
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(approvals.createdAt));
    }
    
    return await query.orderBy(desc(approvals.createdAt));
  }

  async createApproval(approval: InsertApproval): Promise<Approval> {
    const [newApproval] = await db.insert(approvals).values([approval]).returning();
    return newApproval;
  }

  async updateApproval(id: number, updates: Partial<Approval>): Promise<Approval> {
    const [updatedApproval] = await db
      .update(approvals)
      .set(updates)
      .where(eq(approvals.id, id))
      .returning();
    return updatedApproval;
  }

  // Comments
  async getComments(postId: number): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values([comment]).returning();
    return newComment;
  }

  // Analytics
  async getAnalytics(postId?: number, platform?: string): Promise<Analytics[]> {
    let query = db.select().from(analytics);
    
    const conditions = [];
    if (postId) conditions.push(eq(analytics.postId, postId));
    if (platform) conditions.push(eq(analytics.platform, platform));
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(analytics.recordedAt));
    }
    
    return await query.orderBy(desc(analytics.recordedAt));
  }

  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [newAnalytics] = await db.insert(analytics).values([analyticsData]).returning();
    return newAnalytics;
  }

  async getAnalyticsSummary(brandId: number, startDate: Date, endDate: Date): Promise<{
    totalReach: number;
    totalEngagement: number;
    totalPosts: number;
    totalViews: number;
  }> {
    const result = await db
      .select({
        totalReach: sql<number>`coalesce(sum(${analytics.reach}), 0)`,
        totalEngagement: sql<number>`coalesce(sum(${analytics.engagement}), 0)`,
        totalPosts: sql<number>`count(distinct ${posts.id})`,
        totalViews: sql<number>`coalesce(sum(${analytics.views}), 0)`
      })
      .from(analytics)
      .innerJoin(posts, eq(analytics.postId, posts.id))
      .where(and(
        eq(posts.brandId, brandId),
        gte(analytics.recordedAt, startDate),
        lte(analytics.recordedAt, endDate)
      ));
    
    return result[0] || {
      totalReach: 0,
      totalEngagement: 0,
      totalPosts: 0,
      totalViews: 0
    };
  }

  // Brand Assets
  async getBrandAssets(brandId: number): Promise<BrandAsset[]> {
    return await db.select().from(brandAssets)
      .where(eq(brandAssets.brandId, brandId))
      .orderBy(desc(brandAssets.createdAt));
  }

  async createBrandAsset(asset: InsertBrandAsset): Promise<BrandAsset> {
    const [newAsset] = await db.insert(brandAssets).values([asset]).returning();
    return newAsset;
  }

  // Brand management methods
  async updateBrand(id: number, updates: Partial<Brand>): Promise<Brand> {
    const [updatedBrand] = await db
      .update(brands)
      .set(updates)
      .where(eq(brands.id, id))
      .returning();
    return updatedBrand;
  }

  async deleteBrand(id: number): Promise<void> {
    await db.delete(brands).where(eq(brands.id, id));
  }
}

export const storage = new DatabaseStorage();