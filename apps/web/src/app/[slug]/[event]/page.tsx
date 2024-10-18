import { SchedulingInterface } from "./scheduleBox";

export interface EventSlugParams {
  params: {
    event: string;
    slug: string;
  };
}

export default function Page({ params }: EventSlugParams) {
  return (
    <div className="p-10">
      <SchedulingInterface params={params} />
    </div>
  );
}
