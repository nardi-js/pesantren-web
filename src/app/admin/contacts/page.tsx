"use client";
import { Modal } from "@/components/admin/Modal";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/ToastProvider";

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  priority: "low" | "medium" | "high";
  source: "website" | "admin";
  ipAddress?: string;
  respondedBy?: string;
  respondedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactsResponse {
  success: boolean;
  data: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    unread: number;
    read: number;
    replied: number;
    archived: number;
  };
}

export default function ContactsListPage() {
  return <ContactsListClient />;
}

function ContactsListClient() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [readMessageOpen, setReadMessageOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0,
  });
  const { push } = useToast();

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (filter !== "all") params.append("status", filter);

      const response = await fetch(`/api/admin/contacts?${params}`);
      const result: ContactsResponse = await response.json();

      if (result.success) {
        setContacts(result.data);
        setStats(result.stats);
      } else {
        throw new Error("Failed to fetch contacts");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      push({
        title: "Error",
        description: "Gagal memuat data kontak",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filter, push]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Delete contact
  const handleDelete = async () => {
    if (!selectedContact) return;

    try {
      const response = await fetch(
        `/api/admin/contacts/${selectedContact._id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        push({
          title: "Berhasil",
          description: "Pesan kontak berhasil dihapus",
          variant: "success",
        });
        fetchContacts();
      } else {
        throw new Error(result.error || "Failed to delete contact");
      }
    } catch (error) {
      console.error("Delete error:", error);
      push({
        title: "Error",
        description: "Gagal menghapus pesan kontak",
        variant: "error",
      });
    } finally {
      setDeleteOpen(false);
      setSelectedContact(null);
    }
  };

  // Update contact status
  const updateStatus = async (
    contact: Contact,
    newStatus: Contact["status"]
  ) => {
    try {
      const response = await fetch(`/api/admin/contacts/${contact._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...contact,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        push({
          title: "Berhasil",
          description: `Status berhasil diubah ke ${newStatus}`,
          variant: "success",
        });
        fetchContacts();
      } else {
        throw new Error(result.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Update status error:", error);
      push({
        title: "Error",
        description: "Gagal mengubah status",
        variant: "error",
      });
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    if (filter === "all") return true;
    return contact.status === filter;
  });

  const getStatusBadge = (status: Contact["status"]) => {
    const statusConfig = {
      unread: { label: "Belum Dibaca", color: "bg-red-100 text-red-800" },
      read: { label: "Sudah Dibaca", color: "bg-blue-100 text-blue-800" },
      replied: { label: "Sudah Dibalas", color: "bg-green-100 text-green-800" },
      archived: { label: "Diarsipkan", color: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: Contact["priority"]) => {
    const priorityConfig = {
      low: { label: "Rendah", color: "bg-gray-100 text-gray-800" },
      medium: { label: "Sedang", color: "bg-yellow-100 text-yellow-800" },
      high: { label: "Tinggi", color: "bg-red-100 text-red-800" },
    };

    const config = priorityConfig[priority];
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pesan Kontak
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola pesan kontak dari pengunjung website
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-semibold text-sm">
                  {stats.unread}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Belum Dibaca
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {stats.read}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Sudah Dibaca
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">
                  {stats.replied}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Sudah Dibalas
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 font-semibold text-sm">
                  {stats.archived}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Diarsipkan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari nama, email, atau subjek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Semua Status</option>
          <option value="unread">Belum Dibaca</option>
          <option value="read">Sudah Dibaca</option>
          <option value="replied">Sudah Dibalas</option>
          <option value="archived">Diarsipkan</option>
        </select>
      </div>

      {/* Contacts Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Memuat data kontak...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Tidak ada pesan kontak ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pengirim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subjek
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Prioritas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {contact.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {contact.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {contact.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contact.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(contact.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(contact.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            setReadMessageOpen(true);
                            // Auto mark as read when viewing message
                            if (contact.status === "unread") {
                              updateStatus(contact, "read");
                            }
                          }}
                          className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                        >
                          Baca Pesan
                        </button>
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            setDetailsOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Detail
                        </button>
                        <select
                          value={contact.status}
                          onChange={(e) =>
                            updateStatus(
                              contact,
                              e.target.value as Contact["status"]
                            )
                          }
                          className="text-xs border-0 bg-transparent text-gray-600 dark:text-gray-400 cursor-pointer"
                        >
                          <option value="unread">Belum Dibaca</option>
                          <option value="read">Sudah Dibaca</option>
                          <option value="replied">Sudah Dibalas</option>
                          <option value="archived">Diarsipkan</option>
                        </select>
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            setDeleteOpen(true);
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={detailsOpen}
        onCloseAction={() => setDetailsOpen(false)}
        title="Detail Pesan Kontak"
      >
        {selectedContact && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedContact.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedContact.email}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subjek
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {selectedContact.subject}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pesan
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                {getStatusBadge(selectedContact.status)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioritas
                </label>
                {getPriorityBadge(selectedContact.priority)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tanggal Dikirim
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(selectedContact.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sumber
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedContact.source === "website" ? "Website" : "Admin"}
                </p>
              </div>
            </div>
            {selectedContact.respondedAt && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dibalas Oleh
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedContact.respondedBy}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tanggal Dibalas
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedContact.respondedAt).toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
              </div>
            )}
            {selectedContact.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catatan
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedContact.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Read Message Modal */}
      <Modal
        open={readMessageOpen}
        onCloseAction={() => setReadMessageOpen(false)}
        title="Baca Pesan"
      >
        {selectedContact && (
          <div className="space-y-6">
            {/* Header with sender info */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg">
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedContact.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedContact.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(selectedContact.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-1">
                {getStatusBadge(selectedContact.status)}
                {getPriorityBadge(selectedContact.priority)}
              </div>
            </div>

            {/* Subject */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Subjek:
              </h4>
              <p className="text-lg text-gray-800 dark:text-gray-200 font-medium">
                {selectedContact.subject}
              </p>
            </div>

            {/* Message Content */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Pesan:
              </h4>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex space-x-2">
                <button
                  onClick={() => updateStatus(selectedContact, "replied")}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Tandai Sudah Dibalas
                </button>
                <button
                  onClick={() => updateStatus(selectedContact, "archived")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Arsipkan
                </button>
              </div>
              <button
                onClick={() => {
                  setReadMessageOpen(false);
                  setDetailsOpen(true);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Lihat Detail Lengkap →
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteOpen}
        onCloseAction={() => setDeleteOpen(false)}
        title="Konfirmasi Hapus"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Apakah Anda yakin ingin menghapus pesan kontak dari{" "}
            <strong>{selectedContact?.name}</strong>? Tindakan ini tidak dapat
            dibatalkan.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
