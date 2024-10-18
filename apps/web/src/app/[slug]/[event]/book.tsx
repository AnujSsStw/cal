import * as React from "react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAction } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { useForm } from "react-hook-form";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

interface Event {
  durationInMinutes: number;
  clerkId: string;
  startTime: string;
  eventName: string;
  eventId: string;
}

export function DrawerDialogDemo({
  open,
  setOpen,
  data,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: Event;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Enter your email and name. Click Confirm when you're done.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm data={data} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Confirm Booking</DrawerTitle>
          <DrawerDescription>
            Enter your email and name. Click Confirm when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" data={data} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({
  className,
  data: calenderDate,
}: {
  className?: string;
  data: Event;
}) {
  const addBooking = useAction(api.calender.create);
  const { register, handleSubmit } = useForm();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const res = await addBooking({
        additionalInfo: data.info,
        clerkId: calenderDate.clerkId,
        durationInMinutes: calenderDate.durationInMinutes,
        eventName: calenderDate.eventName,
        guestEmail: data.email,
        name: data.username,
        startTime: calenderDate.startTime,
        eventId: calenderDate.eventId as Id<"event">,
      });
      if (res) {
        setLoading(false);
        toast({
          title: "Booking Successful",
          description: "Your booking has been confirmed",
        });
        router.push(`/${calenderDate.clerkId}`);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    }
  };

  return (
    <form
      className={cn("grid items-start gap-4", className)}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          defaultValue="api@example.com"
          {...register("email")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="username">Name</Label>
        <Input id="username" defaultValue="ani" {...register("username")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="info">Info</Label>
        <Input
          type="text"
          id="info"
          defaultValue="hello..."
          {...register("info")}
        />
      </div>
      <Button disabled={loading} type="submit">
        Confirm
      </Button>
    </form>
  );
}
