import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createFood = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    caloriesPer100g: v.number(),
    proteinPer100g: v.number(),
    carbsPer100g: v.number(),
    fatsPer100g: v.number(),
  },
  handler: async (ctx, args) => {
    const normalizedName = args.name.trim();
    if (!normalizedName) {
      throw new Error("Food name is required");
    }

    const existingFood = (await ctx.db.query("foodDatabase").collect()).find(
      (food) => food.name.toLowerCase() === normalizedName.toLowerCase()
    );

    if (existingFood) {
      return existingFood;
    }

    const foodId = await ctx.db.insert("foodDatabase", {
      ...args,
      name: normalizedName,
      fiberPer100g: 0,
      sugarPer100g: 0,
      sodiumPer100g: 0,
    });

    return {
      _id: foodId,
      ...args,
      name: normalizedName,
      fiberPer100g: 0,
      sugarPer100g: 0,
      sodiumPer100g: 0,
    };
  },
});

export const searchFood = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const foods = await ctx.db.query("foodDatabase").collect();
    
    return foods.filter(food => 
      food.name.toLowerCase().includes(args.searchTerm.toLowerCase())
    ).slice(0, 10);
  },
});

export const getFoodByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("foodDatabase")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

export const seedFoodDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const existingFoods = await ctx.db.query("foodDatabase").collect();
    if (existingFoods.length > 0) return;

    const foods = [
      // Proteins
      { name: "Chicken Breast", category: "protein", caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatsPer100g: 3.6, fiberPer100g: 0, sugarPer100g: 0, sodiumPer100g: 74 },
      { name: "Salmon", category: "protein", caloriesPer100g: 208, proteinPer100g: 25, carbsPer100g: 0, fatsPer100g: 12, fiberPer100g: 0, sugarPer100g: 0, sodiumPer100g: 59 },
      { name: "Eggs", category: "protein", caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatsPer100g: 11, fiberPer100g: 0, sugarPer100g: 1.1, sodiumPer100g: 124 },
      { name: "Greek Yogurt", category: "dairy", caloriesPer100g: 97, proteinPer100g: 10, carbsPer100g: 3.6, fatsPer100g: 5, fiberPer100g: 0, sugarPer100g: 3.6, sodiumPer100g: 36 },
      
      // Carbohydrates
      { name: "Brown Rice", category: "grains", caloriesPer100g: 111, proteinPer100g: 2.6, carbsPer100g: 23, fatsPer100g: 0.9, fiberPer100g: 1.8, sugarPer100g: 0.4, sodiumPer100g: 5 },
      { name: "Quinoa", category: "grains", caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 22, fatsPer100g: 1.9, fiberPer100g: 2.8, sugarPer100g: 0.9, sodiumPer100g: 7 },
      { name: "Sweet Potato", category: "vegetables", caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatsPer100g: 0.1, fiberPer100g: 3, sugarPer100g: 4.2, sodiumPer100g: 4 },
      { name: "Oats", category: "grains", caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatsPer100g: 6.9, fiberPer100g: 10.6, sugarPer100g: 0.99, sodiumPer100g: 2 },
      
      // Vegetables
      { name: "Broccoli", category: "vegetables", caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatsPer100g: 0.4, fiberPer100g: 2.6, sugarPer100g: 1.5, sodiumPer100g: 33 },
      { name: "Spinach", category: "vegetables", caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatsPer100g: 0.4, fiberPer100g: 2.2, sugarPer100g: 0.4, sodiumPer100g: 79 },
      { name: "Avocado", category: "fruits", caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatsPer100g: 15, fiberPer100g: 7, sugarPer100g: 0.7, sodiumPer100g: 7 },
      
      // Fruits
      { name: "Banana", category: "fruits", caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatsPer100g: 0.3, fiberPer100g: 2.6, sugarPer100g: 12, sodiumPer100g: 1 },
      { name: "Apple", category: "fruits", caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatsPer100g: 0.2, fiberPer100g: 2.4, sugarPer100g: 10, sodiumPer100g: 1 },
      { name: "Blueberries", category: "fruits", caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatsPer100g: 0.3, fiberPer100g: 2.4, sugarPer100g: 10, sodiumPer100g: 1 },
      
      // Nuts and Seeds
      { name: "Almonds", category: "nuts", caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatsPer100g: 50, fiberPer100g: 12, sugarPer100g: 4.4, sodiumPer100g: 1 },
      { name: "Walnuts", category: "nuts", caloriesPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatsPer100g: 65, fiberPer100g: 6.7, sugarPer100g: 2.6, sodiumPer100g: 2 },
    ];

    for (const food of foods) {
      await ctx.db.insert("foodDatabase", food);
    }
  },
});
