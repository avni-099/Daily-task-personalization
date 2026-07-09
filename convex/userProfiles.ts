import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createUserProfile = mutation({
  args: {
    username: v.string(),
    phoneNumber: v.optional(v.string()),
    targetCalories: v.optional(v.number()),
    activityLevel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if username is unique
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingProfile) {
      throw new Error("Username already taken");
    }

    return await ctx.db.insert("userProfiles", {
      userId,
      username: args.username,
      phoneNumber: args.phoneNumber,
      targetCalories: args.targetCalories || 2000,
      activityLevel: args.activityLevel || "moderate",
      preferences: {
        theme: "light",
        notifications: true,
        timezone: "UTC",
      },
    });
  },
});

export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const updateUserProfile = mutation({
  args: {
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    targetCalories: v.optional(v.number()),
    activityLevel: v.optional(v.string()),
    preferences: v.optional(v.object({
      theme: v.string(),
      notifications: v.boolean(),
      timezone: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    // Check username uniqueness if updating username
    if (args.username && args.username !== profile.username) {
      const existingProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_username", (q) => q.eq("username", args.username!))
        .first();

      if (existingProfile) {
        throw new Error("Username already taken");
      }
    }

    return await ctx.db.patch(profile._id, args);
  },
});

export const checkUsernameAvailability = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    return !existingProfile;
  },
});
