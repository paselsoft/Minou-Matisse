import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cats").collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    breed: v.string(),
    age: v.number(),
    weight: v.number(),
    imageUrl: v.string(),
    gender: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("cats", args);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("cats") },
  handler: async (ctx, args) => {
    // Prima cancelliamo tutti i log associati
    const logs = await ctx.db
      .query("logs")
      .withIndex("by_catId", (q) => q.eq("catId", args.id))
      .collect();
    
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    // Poi cancelliamo il gatto
    await ctx.db.delete(args.id);
  },
});

export const updateWeight = mutation({
  args: { id: v.id("cats"), weight: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { weight: args.weight });
  },
});
