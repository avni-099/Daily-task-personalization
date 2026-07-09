import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getRandomQuote = query({
  args: {},
  handler: async (ctx) => {
    const quotes = await ctx.db.query("motivationalQuotes").collect();
    if (quotes.length === 0) {
      return {
        quote: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "motivation"
      };
    }
    
    // Get a truly random quote each time
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  },
});

export const getDailyQuote = query({
  args: {},
  handler: async (ctx) => {
    const quotes = await ctx.db.query("motivationalQuotes").collect();
    if (quotes.length === 0) {
      return {
        quote: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "motivation"
      };
    }
    
    // Get a quote based on the current date for consistency throughout the day
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const index = seed % quotes.length;
    
    return quotes[index];
  },
});

export const addQuote = mutation({
  args: {
    quote: v.string(),
    author: v.string(),
    category: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("motivationalQuotes", args);
  },
});

export const seedQuotes = mutation({
  args: {},
  handler: async (ctx) => {
    const existingQuotes = await ctx.db.query("motivationalQuotes").collect();
    if (existingQuotes.length > 0) return;

    const quotes = [
      { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "motivation", tags: ["success", "courage"] },
      { quote: "The only impossible journey is the one you never begin.", author: "Tony Robbins", category: "motivation", tags: ["journey", "beginning"] },
      { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "opportunity", tags: ["difficulty", "opportunity"] },
      { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "confidence", tags: ["belief", "confidence"] },
      { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "persistence", tags: ["persistence", "progress"] },
      { quote: "Everything you've ever wanted is on the other side of fear.", author: "George Addair", category: "courage", tags: ["fear", "courage"] },
      { quote: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "resilience", tags: ["success", "failure", "enthusiasm"] },
      { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "dreams", tags: ["future", "dreams"] },
      { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "persistence", tags: ["time", "persistence"] },
      { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "action", tags: ["action", "beginning"] },
      { quote: "Your limitation—it's only your imagination.", author: "Unknown", category: "mindset", tags: ["limitation", "imagination"] },
      { quote: "Push yourself, because no one else is going to do it for you.", author: "Unknown", category: "motivation", tags: ["self-motivation", "push"] },
      { quote: "Great things never come from comfort zones.", author: "Unknown", category: "growth", tags: ["comfort zone", "growth"] },
      { quote: "Dream it. Wish it. Do it.", author: "Unknown", category: "action", tags: ["dreams", "action"] },
      { quote: "Success doesn't just find you. You have to go out and get it.", author: "Unknown", category: "success", tags: ["success", "effort"] },
      { quote: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown", category: "achievement", tags: ["work", "achievement"] },
      { quote: "Dream bigger. Do bigger.", author: "Unknown", category: "ambition", tags: ["dreams", "ambition"] },
      { quote: "Don't stop when you're tired. Stop when you're done.", author: "Unknown", category: "persistence", tags: ["persistence", "completion"] },
      { quote: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown", category: "daily", tags: ["determination", "satisfaction"] },
      { quote: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery", category: "future", tags: ["future", "gratitude"] },
    ];

    for (const quote of quotes) {
      await ctx.db.insert("motivationalQuotes", quote);
    }
  },
});
