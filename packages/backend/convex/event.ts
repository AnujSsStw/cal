import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

const EVENT_ARGS = {
  eventName: v.string(),
  description: v.string(),
  durationInMinutes: v.number(),
  isActive: v.boolean(),
  eventDate: v.object({
    startDate: v.string(),
    endDate: v.string(),
  }),
};

export const createEvent = mutation({
  args: EVENT_ARGS,
  handler: async (
    ctx,
    { eventName, description, durationInMinutes, isActive, eventDate }
  ) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      await ctx.db.insert("event", {
        eventName,
        description,
        durationInMinutes,
        isActive,
        eventDate,
        clerkUserId: user.subject,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
});

export const getEvents_byClerkUserId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    return await ctx.db
      .query("event")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .order("asc")
      .collect();
  },
});

export const getEvents = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("User not authenticated");
    }

    return await ctx.db
      .query("event")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", user.subject))
      .order("asc")
      .collect();
  },
});

export const getEvent_byId = query({
  args: { id: v.optional(v.id("event")) },
  handler: async (ctx, { id }) => {
    if (!id) {
      return null;
    }

    return await ctx.db.get(id);
  },
});

export const updateEvent = mutation({
  args: {
    ...EVENT_ARGS,
    id: v.id("event"),
  },
  handler: async (
    ctx,
    { id, eventName, description, durationInMinutes, isActive, eventDate }
  ) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      await ctx.db.patch(id, {
        eventName,
        description,
        durationInMinutes,
        isActive,
        eventDate,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
});

export const deleteEvent = mutation({
  args: { id: v.id("event") },
  handler: async (ctx, { id }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      await ctx.db.delete(id);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
});
