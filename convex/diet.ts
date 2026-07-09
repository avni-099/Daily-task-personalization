import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getDietPlan = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.date) {
      return await ctx.db
        .query("dietPlans")
        .withIndex("by_user_and_date", (q) => 
          q.eq("userId", userId).eq("date", args.date!)
        )
        .collect();
    }

    return await ctx.db
      .query("dietPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addDietItem = mutation({
  args: {
    mealType: v.union(v.literal("breakfast"), v.literal("lunch"), v.literal("dinner"), v.literal("snack")),
    foodItem: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fats: v.number(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("dietPlans", {
      userId,
      ...args,
      completed: false,
    });
  },
});

export const updateDietItem = mutation({
  args: {
    dietId: v.id("dietPlans"),
    completed: v.optional(v.boolean()),
    calories: v.optional(v.number()),
    protein: v.optional(v.number()),
    carbs: v.optional(v.number()),
    fats: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { dietId, ...updates } = args;
    return await ctx.db.patch(dietId, updates);
  },
});

export const deleteDietItem = mutation({
  args: { dietId: v.id("dietPlans") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.delete(args.dietId);
  },
});
