import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const drafts = await ctx.db
      .query("drafts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return drafts;
  },
});

export const listPublic = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const drafts = await ctx.db
      .query("drafts")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .order("desc")
      .take(args.limit ?? 20);

    return drafts;
  },
});

export const get = query({
  args: { id: v.id("drafts") },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.id);
    if (!draft) return null;

    const userId = await getAuthUserId(ctx);
    if (!draft.isPublic && draft.userId !== userId) {
      return null;
    }

    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_draft", (q) => q.eq("draftId", args.id))
      .collect();

    return { ...draft, rooms };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    style: v.string(),
    stories: v.number(),
    ceilingHeight: v.number(),
    totalSqm: v.number(),
    width: v.number(),
    depth: v.number(),
    rooms: v.array(v.object({
      roomType: v.string(),
      label: v.string(),
      floor: v.number(),
      width: v.number(),
      depth: v.number(),
      area: v.number(),
      x: v.number(),
      y: v.number(),
      color: v.string(),
    })),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check profile limits for free plan
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile && profile.plan === "free") {
      const now = Date.now();
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

      if (profile.lastResetDate < monthAgo) {
        await ctx.db.patch(profile._id, {
          draftsThisMonth: 0,
          lastResetDate: now,
        });
      } else if (profile.draftsThisMonth >= 3) {
        throw new Error("Monthly draft limit reached. Upgrade to Plus for unlimited drafts.");
      }
    }

    const draftId = await ctx.db.insert("drafts", {
      userId,
      name: args.name,
      style: args.style,
      stories: args.stories,
      ceilingHeight: args.ceilingHeight,
      totalSqm: args.totalSqm,
      width: args.width,
      depth: args.depth,
      floorplanJson: JSON.stringify(args.rooms),
      isPublic: args.isPublic,
      pinCount: 0,
      createdAt: Date.now(),
    });

    // Insert rooms
    for (const room of args.rooms) {
      await ctx.db.insert("rooms", {
        draftId,
        ...room,
      });
    }

    // Update profile draft count
    if (profile) {
      await ctx.db.patch(profile._id, {
        draftsThisMonth: profile.draftsThisMonth + 1,
      });
    }

    return draftId;
  },
});

export const remove = mutation({
  args: { id: v.id("drafts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const draft = await ctx.db.get(args.id);
    if (!draft || draft.userId !== userId) {
      throw new Error("Draft not found");
    }

    // Delete associated rooms
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_draft", (q) => q.eq("draftId", args.id))
      .collect();

    for (const room of rooms) {
      await ctx.db.delete(room._id);
    }

    // Delete associated pins
    const pins = await ctx.db
      .query("pins")
      .withIndex("by_draft", (q) => q.eq("draftId", args.id))
      .collect();

    for (const pin of pins) {
      await ctx.db.delete(pin._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const togglePublic = mutation({
  args: { id: v.id("drafts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const draft = await ctx.db.get(args.id);
    if (!draft || draft.userId !== userId) {
      throw new Error("Draft not found");
    }

    await ctx.db.patch(args.id, { isPublic: !draft.isPublic });
  },
});
