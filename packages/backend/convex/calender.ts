"use node";
import { ClerkClient, createClerkClient } from "@clerk/backend";
import { v } from "convex/values";
import { addMinutes } from "date-fns";
import { google } from "googleapis";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

export const create = action({
  args: {
    eventId: v.id("event"),
    clerkId: v.string(),
    name: v.string(),
    guestEmail: v.string(),
    additionalInfo: v.string(),
    startTime: v.string(),
    durationInMinutes: v.number(),
    eventName: v.string(),
  },
  handler: async (
    ctx,
    {
      durationInMinutes,
      eventId,
      clerkId,
      name,
      guestEmail,
      additionalInfo,
      startTime,
      eventName,
    },
  ) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    try {
      const client = await getOAuthClient(clerkId, clerkClient);

      const calendarUser = await clerkClient.users.getUser(clerkId);

      if (calendarUser.primaryEmailAddress == null) {
        throw new Error("Clerk user has no email");
      }

      const calendarEvnent = await google.calendar("v3").events.insert({
        calendarId: "primary",
        auth: client,
        sendUpdates: "all",
        requestBody: {
          attendees: [
            { email: guestEmail, displayName: name },
            {
              email: calendarUser.primaryEmailAddress.emailAddress,
              displayName: calendarUser.fullName,
              responseStatus: "accepted",
            },
          ],
          description: additionalInfo
            ? `Additional Details: ${additionalInfo}`
            : undefined,
          start: {
            dateTime: new Date(startTime).toISOString(),
          },
          end: {
            dateTime: addMinutes(
              new Date(startTime),
              durationInMinutes,
            ).toISOString(),
          },
          summary: `${name} + ${calendarUser.fullName}: ${eventName}`,
        },
      });

      await ctx.runMutation(internal.bookings.m, {
        additionalInfo,
        email: guestEmail,
        endTime: calendarEvnent.data.end?.dateTime as string,
        eventId,
        googleCalendarEventId: calendarEvnent.data.id as string,
        name,
        startTime: calendarEvnent.data.start?.dateTime as string,
        userId: clerkId,
        htmlLink: calendarEvnent.data.htmlLink,
      });

      return calendarEvnent.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
});

export const deleteBooking = action({
  args: {
    bookingId: v.id("booking"),
    googleCalendarEventId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { bookingId, googleCalendarEventId, userId }) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    try {
      const client = await getOAuthClient(userId, clerkClient);

      await google.calendar("v3").events.delete({
        calendarId: "primary",
        eventId: googleCalendarEventId,
        auth: client,
      });

      await ctx.runMutation(internal.bookings.deleteBooking, {
        bookingId,
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
});

async function getOAuthClient(clerkUserId: string, clerkClient: ClerkClient) {
  try {
    const token = await clerkClient.users.getUserOauthAccessToken(
      clerkUserId,
      "oauth_google",
    );

    if (token.data.length === 0 || token.data[0].token == null) {
      return;
    }
    console.log(token.data[0].token);

    const client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URL,
    );

    client.setCredentials({ access_token: token.data[0].token });

    return client;
  } catch (error) {
    console.log("while creating a client", error);
    return;
  }
}
