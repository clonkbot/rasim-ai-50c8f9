import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing._id;

    const now = Date.now();
    return await ctx.db.insert("profiles", {
      userId,
      plan: "free",
      cadExportsUsed: 0,
      cadExportsLimit: 0,
      draftsThisMonth: 0,
      lastResetDate: now,
    });
  },
});

export const updatePlan = mutation({
  args: { plan: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    const limits = {
      free: 0,
      plus: 1,
      pro: -1, // unlimited
    };

    await ctx.db.patch(profile._id, {
      plan: args.plan,
      cadExportsLimit: limits[args.plan as keyof typeof limits] ?? 0,
    });
  },
});
