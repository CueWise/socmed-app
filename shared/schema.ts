import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ['creator', 'editor', 'approver', 'admin'] }).notNull().default('creator'),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  colorPalette: json("color_palette").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  name: text("name", { enum: ['instagram', 'facebook', 'tiktok', 'twitter'] }).notNull(),
  accessToken: text("access_token"),
  isActive: boolean("is_active").default(true),
  brandId: integer("brand_id").references(() => brands.id),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  mediaUrls: json("media_urls").$type<string[]>(),
  platforms: json("platforms").$type<string[]>().notNull(),
  status: text("status", { enum: ['draft', 'pending_approval', 'approved', 'scheduled', 'published', 'rejected'] }).notNull().default('draft'),
  scheduledAt: text("scheduled_at"),
  publishedAt: timestamp("published_at"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  hashtags: json("hashtags").$type<string[]>(),
  notes: text("notes"),
  aiGenerated: boolean("ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const approvals = pgTable("approvals", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  reviewerId: integer("reviewer_id").references(() => users.id).notNull(),
  status: text("status", { enum: ['pending', 'approved', 'rejected', 'changes_requested'] }).notNull().default('pending'),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  platform: text("platform").notNull(),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  reach: integer("reach").default(0),
  engagement: integer("engagement").default(0),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const brandAssets = pgTable("brand_assets", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  name: text("name").notNull(),
  type: text("type", { enum: ['logo', 'template', 'image', 'video'] }).notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});



// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  approvals: many(approvals),
  comments: many(comments),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  posts: many(posts),
  platforms: many(platforms),
  assets: many(brandAssets),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  creator: one(users, { fields: [posts.createdBy], references: [users.id] }),
  brand: one(brands, { fields: [posts.brandId], references: [brands.id] }),
  approvals: many(approvals),
  comments: many(comments),
  analytics: many(analytics),
}));

export const approvalsRelations = relations(approvals, ({ one }) => ({
  post: one(posts, { fields: [approvals.postId], references: [posts.id] }),
  reviewer: one(users, { fields: [approvals.reviewerId], references: [users.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  post: one(posts, { fields: [analytics.postId], references: [posts.id] }),
}));

export const brandAssetsRelations = relations(brandAssets, ({ one }) => ({
  brand: one(brands, { fields: [brandAssets.brandId], references: [brands.id] }),
}));



// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true, createdAt: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertApprovalSchema = createInsertSchema(approvals).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({ id: true, recordedAt: true });
export const insertBrandAssetSchema = createInsertSchema(brandAssets).omit({ id: true, createdAt: true });


// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Approval = typeof approvals.$inferSelect;
export type InsertApproval = z.infer<typeof insertApprovalSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type BrandAsset = typeof brandAssets.$inferSelect;
export type InsertBrandAsset = z.infer<typeof insertBrandAssetSchema>;

