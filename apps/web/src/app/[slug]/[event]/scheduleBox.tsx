"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "convex/react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { DrawerDialogDemo } from "./book";
import { EventSlugParams } from "./page";
import { parseISO, addMinutes, format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

export function SchedulingInterface({ params }: EventSlugParams) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const event = useQuery(api.event.getEvent_byId, {
    id: params.event as Id<"event">,
  });
  const schedule = useQuery(api.schedule.getSchedule_byId, {
    id: params.slug as Id<"schedule">,
  });
  const user = useQuery(api.user.getUserById, { userId: params.slug });
  const bookings = useQuery(api.bookings.getBookingByUserId, {
    userId: params.slug,
  });
  const [slots, setSlots] = useState<Date[]>([]);
  const [open, setOpen] = useState(false);
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  useEffect(() => {
    if (!event || !schedule || !bookings) return;
    if (!date) {
      setSelectedTime(null);
      return;
    }
    const time_availability = schedule.availability.find(
      (a) => a.day === date?.toLocaleDateString("en-US", { weekday: "long" }),
    )?.time;

    if (!time_availability) return;
    let a = generateTimeSlots(
      time_availability,
      event.durationInMinutes,
      timeZone,
    );

    setSlots(a);
  }, [date, timeZone]);

  if (!event || !schedule || !user)
    return (
      <div className="flex justify-center items-center h-screen">
        <img src="https://i.cdn.turner.com/adultswim/big/img/2018/04/20/eye.gif" />
      </div>
    );

  return (
    <div className="flex bg-gray-100 border  rounded-lg shadow-lg">
      {/* Left Sidebar */}
      <div className="w-1/4 p-6 bg-white border-r">
        <div className="flex items-center mb-8 ">
          <CalendarIcon className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-xl font-bold">Cal</h1>
        </div>
        <div className="mb-6">
          {
            <>
              <Avatar className="w-16 h-16 mb-4">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.name}</AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold">
                {user.name.replace("null", "")}
              </h2>
            </>
          }
          <h3 className="text-2xl font-bold mb-4">{event.eventName}</h3>
          <div className="flex items-center text-gray-600 mb-2">
            <Clock className="w-5 h-5 mr-2" />
            <span>{event?.durationInMinutes} min</span>
          </div>
          {/* TODO */}
          {/* <div className="flex items-center text-gray-600">
            <Video className="w-5 h-5 mr-2" />
            <span>Zoom</span>
          </div> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">Select a Date & Time</h2>
        <Card>
          <CardContent className="p-6">
            {/* Calendar */}
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              styles={{
                caption_end: { width: "100%" },
              }}
              toDate={new Date(event.eventDate.endDate)}
              fromDate={
                new Date(event.eventDate.startDate) <= new Date()
                  ? new Date(event.eventDate.startDate)
                  : new Date()
              }
              disabled={(date) => {
                // schedule give the availability in days of the week
                const day = date.toLocaleDateString("en-US", {
                  weekday: "long",
                });
                return !schedule.availability.some((a) => a.day === day);
              }}
            />

            {/* Time Zone Selector */}

            <Select
              onValueChange={(value) => {
                setTimeZone(value);
              }}
              value={timeZone}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={Intl.DateTimeFormat().resolvedOptions().timeZone}
                />
              </SelectTrigger>
              <SelectContent>
                {Intl.supportedValuesOf("timeZone").map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar */}
      <div className="w-1/4 p-6 bg-white border-l">
        <h3 className="text-lg font-semibold mb-4">
          {date?.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h3>
        {schedule.availability.map((d) => {
          if (
            d.day === date?.toLocaleDateString("en-US", { weekday: "long" })
          ) {
            return (
              <ScrollArea className="h-72 p-3" key={d.day}>
                {slots.map((slot, i) => {
                  const time = slot.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                  });

                  return (
                    <Button
                      key={i}
                      className="w-full mb-4"
                      onClick={() => setSelectedTime(time)}
                      disabled={bookings?.some(
                        (booking) =>
                          new Date(booking.startTime).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "numeric",
                            },
                          ) === time,
                      )}
                      variant={selectedTime === time ? "default" : "outline"}
                    >
                      {time}
                    </Button>
                  );
                })}
              </ScrollArea>
            );
          }
        })}
        <Button
          onClick={() => {
            setOpen(true);
          }}
          className="w-full mt-4"
          disabled={!selectedTime}
        >
          Confirm
        </Button>
      </div>

      {selectedTime && date && (
        <DrawerDialogDemo
          open={open}
          setOpen={setOpen}
          data={{
            clerkId: params.slug,
            durationInMinutes: event.durationInMinutes,
            eventName: event.eventName,
            startTime: new Date(
              date.toLocaleDateString("en-US") + " " + selectedTime,
            ).toISOString(),
            eventId: params.event,
          }}
        />
      )}
    </div>
  );
}

function generateTimeSlots(
  timeRanges: { startTime: string; endTime: string }[],
  durationInMinutes: number,
  timezone: string,
) {
  const timeSlots: Date[] = [];

  timeRanges.forEach(({ startTime, endTime }) => {
    // Parse start and end times in the specified timezone
    const start = utcToZonedTime(
      parseISO(`1970-01-01T${startTime}:00`),
      timezone,
    );
    const end = utcToZonedTime(parseISO(`1970-01-01T${endTime}:00`), timezone);

    let current = start;

    while (current < end) {
      timeSlots.push(new Date(current)); // Store the slot as a Date
      current = addMinutes(current, durationInMinutes); // Add duration to the current time
    }
  });

  return timeSlots;
}
