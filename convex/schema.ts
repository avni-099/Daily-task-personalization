import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Enhanced user profiles
  userProfiles: defineTable({
    userId: v.id("users"),
    username: v.string(),
    phoneNumber: v.optional(v.string()),
    targetCalories: v.optional(v.number()),
    activityLevel: v.optional(v.string()),
    preferences: v.optional(v.object({
      theme: v.string(),
      notifications: v.boolean(),
      timezone: v.string(),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_username", ["username"]),

  tasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.string(),
    endTime: v.string(),
    date: v.string(),
    category: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    completed: v.boolean(),
    recurring: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_category", ["userId", "category"]),

  dietPlans: defineTable({
    userId: v.id("users"),
    mealType: v.union(v.literal("breakfast"), v.literal("lunch"), v.literal("dinner"), v.literal("snack")),
    foodItem: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fats: v.number(),
    fiber: v.optional(v.number()),
    sugar: v.optional(v.number()),
    sodium: v.optional(v.number()),
    date: v.string(),
    completed: v.boolean(),
    servingSize: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),

  // Food database for automatic macros
  foodDatabase: defineTable({
    name: v.string(),
    category: v.string(),
    caloriesPer100g: v.number(),
    proteinPer100g: v.number(),
    carbsPer100g: v.number(),
    fatsPer100g: v.number(),
    fiberPer100g: v.optional(v.number()),
    sugarPer100g: v.optional(v.number()),
    sodiumPer100g: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"]),

  motivationalQuotes: defineTable({
    quote: v.string(),
    author: v.string(),
    category: v.string(),
    tags: v.optional(v.array(v.string())),
  }),

  userProgress: defineTable({
    userId: v.id("users"),
    date: v.string(),
    tasksCompleted: v.number(),
    totalTasks: v.number(),
    caloriesConsumed: v.number(),
    targetCalories: v.number(),
    productivityScore: v.number(),
    mood: v.optional(v.string()),
    energyLevel: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("task"), v.literal("diet"), v.literal("motivation")),
    read: v.boolean(),
    scheduledFor: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_scheduled", ["userId", "scheduledFor"]),

  // User achievements and streaks
  userAchievements: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    description: v.string(),
    unlockedAt: v.number(),
    icon: v.string(),
  })
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
