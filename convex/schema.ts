import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cats: defineTable({
    name: v.string(),
    breed: v.string(),
    age: v.number(),
    weight: v.number(),
    imageUrl: v.string(),
    gender: v.string(), // "Maschio" | "Femmina"
  }),
  logs: defineTable({
    catId: v.id("cats"),
    type: v.string(),
    timestamp: v.string(),
    notes: v.string(),
    value: v.optional(v.string()),
  }).index("by_catId", ["catId"]),
});