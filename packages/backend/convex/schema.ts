import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  event: defineTable({
    eventName: v.string(),
    description: v.string(),
    durationInMinutes: v.number(),
    clerkUserId: v.string(),
    isActive: v.boolean(),
    eventDate: v.object({
      startDate: v.string(),
      endDate: v.string(),
    }),

    updatedAt: v.string(),
    timezone: v.optional(v.string()),
  }).index("by_clerkUserId", ["clerkUserId"]),

  schedule: defineTable({
    clerkUserId: v.string(),
    timezone: v.string(),
    availability: v.array(
      v.object({
        day: v.string(),

        // This is a time string in the format of "HH:mm"
        time: v.array(v.object({ startTime: v.string(), endTime: v.string() })),
      }),
    ),
    updatedAt: v.string(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  booking: defineTable({
    eventId: v.id("event"),
    userId: v.string(),

    name: v.string(),
    email: v.string(),
    additionalInfo: v.string(),
    startTime: v.string(),
    endTime: v.string(),

    googleCalendarEventId: v.string(),
    htmllink: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  user: defineTable({
    clerkUserId: v.string(),

    email: v.string(),
    name: v.string(),
    avatarUrl: v.string(),
  }).index("by_clerkUserId", ["clerkUserId"]),
});
