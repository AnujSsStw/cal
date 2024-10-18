"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "convex/react";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { api } from "@packages/backend/convex/_generated/api";

export function UserEvents({ id }: { id: string }) {
  const user = useQuery(api.user.getUserById, { userId: id });
  const events = useQuery(api.event.getEvents_byClerkUserId, {
    clerkUserId: id as any,
  });

  if (!events || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src="https://i.cdn.turner.com/adultswim/big/img/2018/04/20/eye.gif" />
      </div>
    );
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row gap-6">
            <aside className="md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {user.name.replace("null", "")}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {"UTC"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Welcome to my scheduling page. Please select an event type
                    to book a time with me.
                  </p>
                </CardContent>
              </Card>
            </aside>

            <section className="md:w-2/3">
              <h2 className="text-2xl font-semibold mb-4">
                Select an event type
              </h2>
              <div className="grid gap-4">
                {events.map((event) => (
                  <Card key={event._id}>
                    <CardHeader>
                      <CardTitle>{event.eventName}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {event.durationInMinutes} minutes
                        {/* potential field */}
                        {/* {event.type === "video" ? (
                          <Video className="h-4 w-4 ml-2" />
                        ) : (
                          <Users className="h-4 w-4 ml-2" />
                        )}
                        {event.type === "video" ? "Video call" : "In-person"} */}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button asChild>
                        <Link href={`/${event.clerkUserId}/${event._id}`}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Select
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
