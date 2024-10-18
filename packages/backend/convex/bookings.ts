import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";

export const createBooking = action({
  args: {},
  handler: async (ctx, args) => {},
});

export const m = internalMutation({
  args: {
    eventId: v.id("event"),
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    additionalInfo: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    googleCalendarEventId: v.string(),
    htmlLink: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      eventId,
      userId,
      name,
      email,
      additionalInfo,
      startTime,
      endTime,
      googleCalendarEventId,
      htmlLink,
    },
  ) => {
    await ctx.db.insert("booking", {
      eventId,
      userId,
      name,
      email,
      additionalInfo,
      startTime,
      endTime,
      googleCalendarEventId,
      htmllink: htmlLink,
    });
  },
});

export const getBooking = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user == null) {
      throw new Error("No user found");
    }

    const bookings = await ctx.db
      .query("booking")
      .withIndex("by_userId", (q) => q.eq("userId", user.subject))
      .collect();

    const events = await ctx.db.query("event").collect();

    return bookings.map((booking) => {
      const event = events.find((e) => e._id === booking.eventId);
      return {
        ...booking,
        eventName: event?.eventName,
        description: event?.description,
        isActive: event?.isActive,
      };
    });
  },
});

export const getBookingByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("booking")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const deleteBooking = internalMutation({
  args: { bookingId: v.id("booking") },
  handler: async (ctx, { bookingId }) => {
    await ctx.db.delete(bookingId);
  },
});
