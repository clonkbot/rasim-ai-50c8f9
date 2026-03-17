import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // User profiles with plan info
  profiles: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    plan: v.string(), // 'free' | 'plus' | 'pro'
    cadExportsUsed: v.number(),
    cadExportsLimit: v.number(),
    draftsThisMonth: v.number(),
    lastResetDate: v.number(),
  }).index("by_user", ["userId"]),

  // Floor plan drafts
  drafts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    style: v.string(), // 'gulf_traditional' | 'neoclassic' | 'contemporary' | etc
    stories: v.number(),
    ceilingHeight: v.number(), // in meters
    totalSqm: v.number(),
    width: v.number(), // in meters
    depth: v.number(), // in meters
    exteriorImageUrl: v.optional(v.string()),
    floorplanJson: v.optional(v.string()), // JSON string of rooms layout
    isPublic: v.boolean(),
    pinCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_public", ["isPublic", "createdAt"])
    .index("by_pin_count", ["isPublic", "pinCount"]),

  // Rooms within a draft
  rooms: defineTable({
    draftId: v.id("drafts"),
    roomType: v.string(),
    label: v.string(),
    floor: v.number(),
    width: v.number(), // in meters
    depth: v.number(), // in meters
    area: v.number(), // in sqm
    x: v.number(), // position on canvas
    y: v.number(),
    color: v.string(),
  }).index("by_draft", ["draftId"]),

  // User pins/favorites
  pins: defineTable({
    userId: v.id("users"),
    draftId: v.id("drafts"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_draft", ["draftId"])
    .index("by_user_draft", ["userId", "draftId"]),
});
