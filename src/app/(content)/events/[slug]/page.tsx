import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import connectToDatabase from "@/lib/db";
import Event from "@/models/Event";
import { IEvent } from "@/models/Event";
import ShareButton from "@/components/events/ShareButton";
import YouTubePlayer from "@/components/YouTubePlayer";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getEvent(slug: string): Promise<IEvent | null> {
  await connectToDatabase();

  const event = await Event.findOne({
    slug,
    status: "published",
  }).lean();

  if (!event) return null;

  return {
    ...event,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _id: (event._id as any).toString(),
    date: (event.date as Date).toISOString(),
    createdAt: (event.createdAt as Date).toISOString(),
    updatedAt: (event.updatedAt as Date).toISOString(),
  } as unknown as IEvent;
}

async function getRelatedEvents(
  eventId: string,
  category: string
): Promise<IEvent[]> {
  await connectToDatabase();

  const events = await Event.find({
    _id: { $ne: eventId },
    category,
    status: "published",
    date: { $gte: new Date() },
  })
    .sort({ date: 1 })
    .limit(3)
    .lean();

  return events.map(
    (event) =>
      ({
        ...event,
        _id: (event._id as any).toString(),
        date: (event.date as Date).toISOString(),
        createdAt: (event.createdAt as Date).toISOString(),
        updatedAt: (event.updatedAt as Date).toISOString(),
      } as unknown as IEvent)
  );
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const event = await getEvent(resolvedParams.slug);

  if (!event) {
    return {
      title: "Event Tidak Ditemukan",
      description: "Event yang Anda cari tidak ditemukan",
    };
  }

  return {
    title: `${event.title} | Event Pesantren`,
    description: event.description || "Event di pesantren kami",
    openGraph: {
      title: event.title,
      description: event.description || "Event di pesantren kami",
      images: [{ url: event.featuredImage }],
      type: "article",
    },
  };
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const resolvedParams = await params;
  const event = await getEvent(resolvedParams.slug);

  if (!event) {
    notFound();
  }

  const relatedEvents = await getRelatedEvents(
    event._id as string,
    event.category
  );

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <Image
          src={event.featuredImage}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="app-container pb-12">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-sky-500 text-white">
                  {event.category}
                </span>
                <span className="text-white/80 text-sm">
                  {new Date(event.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {event.title}
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                {event.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-base py-16">
        <div className="app-container">
          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            {/* Main Content */}
            <div className="space-y-8">
              {/* Event Info Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="surface-card elevated p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-sky-600 dark:text-sky-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-[hsl(var(--foreground))]">
                      Tanggal & Waktu
                    </h3>
                  </div>
                  <p className="text-sm text-[hsl(var(--foreground-soft))]">
                    {new Date(event.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-[hsl(var(--foreground-soft))]">
                    {event.time} WIB
                  </p>
                </div>

                <div className="surface-card elevated p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-[hsl(var(--foreground))]">
                      Lokasi
                    </h3>
                  </div>
                  <p className="text-sm text-[hsl(var(--foreground-soft))]">
                    {event.location}
                  </p>
                </div>

                {event.capacity && (
                  <div className="surface-card elevated p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-purple-600 dark:text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-[hsl(var(--foreground))]">
                        Kapasitas
                      </h3>
                    </div>
                    <p className="text-sm text-[hsl(var(--foreground-soft))]">
                      {event.capacity} peserta
                    </p>
                  </div>
                )}

                {event.registrationLink && (
                  <div className="surface-card elevated p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-orange-600 dark:text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-[hsl(var(--foreground))]">
                        Pendaftaran
                      </h3>
                    </div>
                    <Link
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                    >
                      Daftar Sekarang
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>

              {/* YouTube Video */}
              {event.youtubeUrl && (
                <div className="surface-card elevated p-8 rounded-xl">
                  <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">
                    Video Event
                  </h2>
                  <YouTubePlayer
                    url={event.youtubeUrl}
                    title={`Video: ${event.title}`}
                  />
                </div>
              )}

              {/* Content */}
              {event.content && (
                <div className="surface-card elevated p-8 rounded-xl">
                  <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">
                    Detail Event
                  </h2>
                  <div
                    className="prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: event.content }}
                  />
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="surface-card elevated p-6 rounded-xl">
                  <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="surface-card elevated p-6 rounded-xl">
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4">
                  Aksi Cepat
                </h3>
                <div className="space-y-3">
                  {event.registrationLink && (
                    <Link
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full btn-primary"
                    >
                      Daftar Event
                    </Link>
                  )}
                  <ShareButton
                    title={event.title}
                    description={event.description}
                  />
                  <Link href="/events" className="w-full btn-outline">
                    Kembali ke Events
                  </Link>
                </div>
              </div>

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <div className="surface-card elevated p-6 rounded-xl">
                  <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4">
                    Event Terkait
                  </h3>
                  <div className="space-y-4">
                    {relatedEvents.map((relatedEvent) => (
                      <Link
                        key={relatedEvent._id as string}
                        href={`/events/${relatedEvent.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={relatedEvent.featuredImage}
                              alt={relatedEvent.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-[hsl(var(--foreground))] line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                              {relatedEvent.title}
                            </h4>
                            <p className="text-xs text-[hsl(var(--foreground-soft))] mt-1">
                              {new Date(relatedEvent.date).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
