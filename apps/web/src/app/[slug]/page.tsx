import { UserEvents } from "./eventsGrid";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div>
      <UserEvents id={params.slug} />
    </div>
  );
}
