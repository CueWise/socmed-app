import { DatabaseStorage, IStorage } from "../storage";
import { cache, CACHE_KEYS } from "../cache";
import { 
  User, UpsertUser, Brand, InsertBrand, Post, InsertPost, 
  Approval, InsertApproval, Comment, InsertComment,
  Analytics, InsertAnalytics, BrandAsset, InsertBrandAsset 
} from "../../shared/schema";

// Optimized storage layer with caching and performance improvements
export class OptimizedStorage implements IStorage {
  private storage: DatabaseStorage;

  constructor() {
    this.storage = new DatabaseStorage();
  }

  // User operations with caching
  async getUser(id: string): Promise<User | undefined> {
    const cached = await cache.get<User>(CACHE_KEYS.USER(id));
    if (cached) return cached;

    const user = await this.storage.getUser(id);
    if (user) {
      await cache.set(CACHE_KEYS.USER(id), user, 3600); // Cache for 1 hour
    }
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user = await this.storage.upsertUser(userData);
    await cache.set(CACHE_KEYS.USER(user.id), user, 3600);
    return user;
  }

  // Brand operations with caching
  async getBrands(): Promise<Brand[]> {
    const cached = await cache.get<Brand[]>(CACHE_KEYS.BRANDS());
    if (cached) return cached;

    const brands = await this.storage.getBrands();
    await cache.set(CACHE_KEYS.BRANDS(), brands, 300); // Cache for 5 minutes
    return brands;
  }

  async getBrand(id: number): Promise<Brand | undefined> {
    // First check brands cache
    const brands = await cache.get<Brand[]>(CACHE_KEYS.BRANDS());
    if (brands) {
      const brand = brands.find(b => b.id === id);
      if (brand) return brand;
    }

    const brand = await this.storage.getBrand(id);
    if (brand) {
      // Update the brands cache
      const allBrands = await this.getBrands();
      const updatedBrands = allBrands.map(b => b.id === id ? brand : b);
      await cache.set(CACHE_KEYS.BRANDS(), updatedBrands, 300);
    }
    return brand;
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const newBrand = await this.storage.createBrand(brand);
    await cache.del(CACHE_KEYS.BRANDS()); // Invalidate brands cache
    return newBrand;
  }

  async updateBrand(id: number, updates: Partial<Brand>): Promise<Brand> {
    const brand = await this.storage.updateBrand(id, updates);
    await cache.del(CACHE_KEYS.BRANDS()); // Invalidate brands cache
    return brand;
  }

  async deleteBrand(id: number): Promise<void> {
    await this.storage.deleteBrand(id);
    await cache.del(CACHE_KEYS.BRANDS()); // Invalidate brands cache
    await cache.invalidatePattern(`posts:${id}:*`); // Invalidate related posts
  }

  // Post operations with intelligent caching
  async getPosts(brandId?: number, status?: string): Promise<Post[]> {
    const cacheKey = CACHE_KEYS.POSTS(brandId, status);
    const cached = await cache.get<Post[]>(cacheKey);
    if (cached) return cached;

    const posts = await this.storage.getPosts(brandId, status);
    await cache.set(cacheKey, posts, 120); // Cache for 2 minutes (posts change frequently)
    return posts;
  }

  async getPost(id: number): Promise<Post | undefined> {
    // Try to find in cached posts first
    const allPosts = await cache.get<Post[]>(CACHE_KEYS.POSTS());
    if (allPosts) {
      const post = allPosts.find(p => p.id === id);
      if (post) return post;
    }

    return await this.storage.getPost(id);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const newPost = await this.storage.createPost(post);
    // Invalidate relevant caches
    await cache.invalidatePattern(`posts:*`);
    await cache.invalidatePattern(`calendar:*`);
    return newPost;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post> {
    const post = await this.storage.updatePost(id, updates);
    // Invalidate relevant caches
    await cache.invalidatePattern(`posts:*`);
    await cache.invalidatePattern(`calendar:*`);
    return post;
  }

  async deletePost(id: number): Promise<void> {
    await this.storage.deletePost(id);
    // Invalidate relevant caches
    await cache.invalidatePattern(`posts:*`);
    await cache.invalidatePattern(`calendar:*`);
  }

  async getPostsByDateRange(start: Date, end: Date, brandId?: number): Promise<Post[]> {
    const month = start.toISOString().slice(0, 7); // YYYY-MM format
    const cacheKey = CACHE_KEYS.CALENDAR(brandId, month);
    const cached = await cache.get<Post[]>(cacheKey);
    if (cached) {
      // Filter cached results for exact date range
      return cached.filter(post => {
        if (!post.scheduledAt) return false;
        const postDate = new Date(post.scheduledAt);
        return postDate >= start && postDate <= end;
      });
    }

    const posts = await this.storage.getPostsByDateRange(start, end, brandId);
    await cache.set(cacheKey, posts, 300); // Cache for 5 minutes
    return posts;
  }

  // Approval operations
  async getApprovals(postId?: number, status?: string): Promise<Approval[]> {
    return await this.storage.getApprovals(postId, status);
  }

  async createApproval(approval: InsertApproval): Promise<Approval> {
    return await this.storage.createApproval(approval);
  }

  async updateApproval(id: number, updates: Partial<Approval>): Promise<Approval> {
    return await this.storage.updateApproval(id, updates);
  }

  // Comment operations
  async getComments(postId: number): Promise<Comment[]> {
    return await this.storage.getComments(postId);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    return await this.storage.createComment(comment);
  }

  // Analytics operations with heavy caching
  async getAnalytics(postId?: number, platform?: string): Promise<Analytics[]> {
    return await this.storage.getAnalytics(postId, platform);
  }

  async createAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    const result = await this.storage.createAnalytics(analytics);
    // Invalidate analytics caches
    await cache.invalidatePattern(`analytics:*`);
    return result;
  }

  async getAnalyticsSummary(brandId: number, startDate: Date, endDate: Date): Promise<{
    totalReach: number;
    totalEngagement: number;
    totalPosts: number;
    totalViews: number;
  }> {
    const cacheKey = CACHE_KEYS.ANALYTICS(
      brandId, 
      startDate.toISOString().split('T')[0], 
      endDate.toISOString().split('T')[0]
    );
    
    const cached = await cache.get<any>(cacheKey);
    if (cached) return cached;

    const summary = await this.storage.getAnalyticsSummary(brandId, startDate, endDate);
    await cache.set(cacheKey, summary, 1800); // Cache for 30 minutes
    return summary;
  }

  // Brand Asset operations
  async getBrandAssets(brandId: number): Promise<BrandAsset[]> {
    return await this.storage.getBrandAssets(brandId);
  }

  async createBrandAsset(asset: InsertBrandAsset): Promise<BrandAsset> {
    return await this.storage.createBrandAsset(asset);
  }

  // Batch operations for efficiency
  async batchCreatePosts(posts: InsertPost[]): Promise<Post[]> {
    // TODO: Implement batch insert for better performance
    const results = await Promise.all(posts.map(post => this.createPost(post)));
    return results;
  }

  // Warm up cache with frequently accessed data
  async warmCache(): Promise<void> {
    console.log('Warming up cache...');
    try {
      await this.getBrands();
      await this.getPosts();
      console.log('Cache warmed successfully');
    } catch (error) {
      console.error('Cache warm-up failed:', error);
    }
  }
}

export const optimizedStorage = new OptimizedStorage();