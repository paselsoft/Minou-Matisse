import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByCat = query({
  args: { catId: v.optional(v.id("cats")) },
  handler: async (ctx, args) => {
    if (!args.catId) return [];
    
    // Ritorna i log più recenti per primi
    const logs = await ctx.db
      .query("logs")
      .withIndex("by_catId", (q) => q.eq("catId", args.catId as any))
      .order("desc") 
      .take(100);
      
    return logs;
  },
});

export const add = mutation({
  args: {
    catId: v.id("cats"),
    type: v.string(),
    timestamp: v.string(),
    notes: v.string(),
    value: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("logs", args);
  },
});
