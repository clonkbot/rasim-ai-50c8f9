import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const pins = await ctx.db
      .query("pins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const drafts = await Promise.all(
      pins.map(async (pin) => {
        const draft = await ctx.db.get(pin.draftId);
        return draft ? { ...draft, pinId: pin._id } : null;
      })
    );

    return drafts.filter(Boolean);
  },
});

export const isPinned = query({
  args: { draftId: v.id("drafts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const pin = await ctx.db
      .query("pins")
      .withIndex("by_user_draft", (q) =>
        q.eq("userId", userId).eq("draftId", args.draftId)
      )
      .first();

    return !!pin;
  },
});

export const toggle = mutation({
  args: { draftId: v.id("drafts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingPin = await ctx.db
      .query("pins")
      .withIndex("by_user_draft", (q) =>
        q.eq("userId", userId).eq("draftId", args.draftId)
      )
      .first();

    const draft = await ctx.db.get(args.draftId);
    if (!draft) throw new Error("Draft not found");

    if (existingPin) {
      await ctx.db.delete(existingPin._id);
      await ctx.db.patch(args.draftId, { pinCount: Math.max(0, draft.pinCount - 1) });
      return false;
    } else {
      await ctx.db.insert("pins", {
        userId,
        draftId: args.draftId,
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.draftId, { pinCount: draft.pinCount + 1 });
      return true;
    }
  },
});
