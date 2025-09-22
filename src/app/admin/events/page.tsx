"use client";
import { Modal } from "@/components/admin/Modal";
import { Pagination } from "@/components/admin/Pagination";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/ToastProvider";
import { AdminApi } from "@/lib/api";
import { useEffect } from "react";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity?: number;
  registered: number;
  registrationOpen: boolean;
  category: string;
  status: "draft" | "published" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
}

export default function EventListPage() {
  return <EventListClient />;
}

function EventListClient() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const { push } = useToast();

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminApi.getEvents({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        status: filter !== "all" ? filter : undefined,
      });

      if (response.success && response.data) {
        const data = response.data as any;
        setEvents(data.data);
        setTotalPages(data.pagination.pages);
        setTotalEvents(data.pagination.total);
      }
    } catch (error) {
      push("Gagal memuat data events", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filter, push]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Delete single event
  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      const response = await AdminApi.deleteEvent(selectedEvent._id);
      if (response.success) {
        push("Event berhasil dihapus", "success");
        fetchEvents();
      }
    } catch (error) {
      push("Gagal menghapus event", "error");
    } finally {
      setDeleteOpen(false);
      setSelectedEvent(null);
    }
  };

  // Bulk select handlers
  const handleSelectAll = () => {
    if (bulkSelected.length === events.length) {
      setBulkSelected([]);
    } else {
      setBulkSelected(events.map((event) => event._id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (bulkSelected.includes(id)) {
      setBulkSelected(bulkSelected.filter((item) => item !== id));
    } else {
      setBulkSelected([...bulkSelected, id]);
    }
  };

  // Status options
  const statusOptions = [
    { value: "all", label: "Semua Status" },
    { value: "draft", label: "Draft" },
    { value: "published", label: "Diterbitkan" },
    { value: "cancelled", label: "Dibatalkan" },
    { value: "completed", label: "Selesai" },
  ];

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status: Event["status"]) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      published: { color: "bg-green-100 text-green-800", label: "Diterbitkan" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Dibatalkan" },
      completed: { color: "bg-blue-100 text-blue-800", label: "Selesai" },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Events
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola events pesantren
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/events/new" className="btn-primary">
            Tambah Event
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Status Filter */}
        <div className="min-w-[200px]">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        {bulkSelected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {bulkSelected.length} dipilih
            </span>
            <button
              onClick={() => {
                // TODO: Implement bulk delete
              }}
              className="btn-outline-red text-sm"
            >
              Hapus Terpilih
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="w-4 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={bulkSelected.length === events.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tanggal & Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Kapasitas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-2/3"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="mt-2 text-sm">Belum ada event</p>
                      <Link
                        href="/admin/events/new"
                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Buat Event Pertama
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr
                    key={event._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={bulkSelected.includes(event._id)}
                        onChange={() => handleSelectOne(event._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {event.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {event.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(event.date)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {event.time} WIB
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {event.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {event.capacity ? (
                          <>
                            {event.registered}/{event.capacity}
                            <div className="text-xs text-gray-500">
                              {event.capacity - event.registered} sisa
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500">Tidak terbatas</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(event.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/events/${event._id}/edit`}
                          className="btn-outline text-xs"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setDeleteOpen(true);
                          }}
                          className="btn-outline-red text-xs"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Menampilkan {events.length} dari {totalEvents} events
      </div>

      {/* Delete Modal */}
      <Modal
        open={deleteOpen}
        title="Hapus Event"
        onCloseAction={() => setDeleteOpen(false)}
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Hapus Event
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Apakah Anda yakin ingin menghapus event &ldquo;
              {selectedEvent?.title}&rdquo;? Tindakan ini tidak dapat
              dibatalkan.
            </p>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={() => setDeleteOpen(false)}
              className="btn-outline"
            >
              Batal
            </button>
            <button onClick={handleDelete} className="btn-red">
              Hapus Event
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
