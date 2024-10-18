import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveSchedule = mutation({
  args: {
    timezone: v.string(),
    availability: v.array(
      v.object({
        day: v.string(),
        // This is a time string in the format of "HH:mm"
        time: v.array(v.object({ startTime: v.string(), endTime: v.string() })),
      })
    ),
  },
  handler: async (ctx, { timezone, availability }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("User not found");
    }
    console.log(availability);

    const schedule = await ctx.db
      .query("schedule")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", user.subject))
      .first();

    if (schedule) {
      await ctx.db.patch(schedule._id, {
        timezone,
        updatedAt: new Date().toISOString(),
        availability,
      });
    } else {
      await ctx.db.insert("schedule", {
        timezone,
        updatedAt: new Date().toISOString(),
        clerkUserId: user.subject,
        availability,
      });
    }

    return true;
  },
});

export const getSchedule = query({
  args: {},
  handler: async (ctx, {}) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("User not found");
    }

    const clerkUserId = user.subject;
    return await ctx.db
      .query("schedule")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();
  },
});

export const getSchedule_byId = query({
  args: { id: v.optional(v.string()) },
  handler: async (ctx, { id }) => {
    if (!id) {
      return null;
    }

    return await ctx.db
      .query("schedule")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", id))
      .first();
  },
});
