import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAnalytics = query({
  args: { 
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const filteredProgress = progress.filter(p => 
      p.date >= args.startDate && p.date <= args.endDate
    );

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const tasksInRange = tasks.filter(t => 
      t.date >= args.startDate && t.date <= args.endDate
    );

    const completedTasks = tasksInRange.filter(t => t.completed).length;
    const totalTasks = tasksInRange.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const categoryStats = tasksInRange.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = { total: 0, completed: 0 };
      }
      acc[task.category].total++;
      if (task.completed) {
        acc[task.category].completed++;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    const avgProductivity = filteredProgress.length > 0 
      ? filteredProgress.reduce((sum, p) => sum + p.productivityScore, 0) / filteredProgress.length
      : 0;

    return {
      completionRate,
      totalTasks,
      completedTasks,
      categoryStats,
      avgProductivity,
      dailyProgress: filteredProgress,
    };
  },
});

export const updateDailyProgress = mutation({
  args: {
    date: v.string(),
    tasksCompleted: v.number(),
    totalTasks: v.number(),
    caloriesConsumed: v.number(),
    targetCalories: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const productivityScore = args.totalTasks > 0 
      ? (args.tasksCompleted / args.totalTasks) * 100 
      : 0;

    const existing = await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).eq("date", args.date)
      )
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        ...args,
        productivityScore,
      });
    } else {
      return await ctx.db.insert("userProgress", {
        userId,
        ...args,
        productivityScore,
      });
    }
  },
});
