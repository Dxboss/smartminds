"use client";

import React, { useState, useMemo, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import type { NewsletterSubscriber } from "@/lib/persistedData";
import {
  deleteNewsletterSubscriberAction,
  toggleNewsletterSubscriberStatusAction,
  subscribeNewsletterAction,
} from "@/app/actions/newsletterActions";

interface Props {
  initialSubscribers: NewsletterSubscriber[];
  userRole: string;
}

export const SubscribersManagerView: React.FC<Props> = ({
  initialSubscribers,
  userRole,
}) => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(initialSubscribers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Manual Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Filtered subscribers list
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      if (statusFilter !== "all" && sub.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesEmail = sub.email.toLowerCase().includes(query);
        const matchesSource = (sub.source || "").toLowerCase().includes(query);
        if (!matchesEmail && !matchesSource) return false;
      }
      return true;
    });
  }, [subscribers, statusFilter, searchQuery]);

  // Statistics
  const totalCount = subscribers.length;
  const activeCount = subscribers.filter((s) => s.status === "active").length;
  const unsubscribedCount = totalCount - activeCount;

  // CSV Export Handler
  const handleExportCsv = () => {
    if (subscribers.length === 0) {
      setNotification({ type: "error", text: "No subscriber records available to export." });
      return;
    }

    const headers = ["ID", "Email", "Status", "Subscribed At", "Source"];
    const rows = filteredSubscribers.map((sub) => [
      `"${sub.id}"`,
      `"${sub.email}"`,
      `"${sub.status}"`,
      `"${sub.subscribedAt}"`,
      `"${sub.source || "website_footer"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smartminds_newsletter_subscribers_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification({
      type: "success",
      text: `Exported ${filteredSubscribers.length} subscriber records to CSV.`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Toggle Status Handler
  const handleToggleStatus = (id: string) => {
    startTransition(async () => {
      try {
        const res = await toggleNewsletterSubscriberStatusAction(id);
        if (res.success && res.newStatus) {
          setSubscribers((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: res.newStatus! } : s))
          );
          setNotification({
            type: "success",
            text: res.message || "Subscriber status updated.",
          });
        } else {
          setNotification({
            type: "error",
            text: res.message || "Failed to update subscriber status.",
          });
        }
      } catch {
        setNotification({ type: "error", text: "Network error updating status." });
      }
      setTimeout(() => setNotification(null), 3500);
    });
  };

  // Delete Subscriber Handler
  const handleDelete = (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove "${email}" from the subscriber registry?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await deleteNewsletterSubscriberAction(id);
        if (res.success) {
          setSubscribers((prev) => prev.filter((s) => s.id !== id));
          setNotification({
            type: "success",
            text: `Removed "${email}" successfully.`,
          });
        } else {
          setNotification({
            type: "error",
            text: res.message || "Could not delete subscriber.",
          });
        }
      } catch {
        setNotification({ type: "error", text: "Network error deleting subscriber." });
      }
      setTimeout(() => setNotification(null), 3500);
    });
  };

  // Manual Add Handler
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim() || isAdding) return;
    setIsAdding(true);
    try {
      const res = await subscribeNewsletterAction(manualEmail, "admin_manual_entry");
      if (res.success && res.subscriber) {
        setSubscribers((prev) => [res.subscriber!, ...prev.filter((s) => s.id !== res.subscriber!.id)]);
        setNotification({
          type: "success",
          text: `Added "${manualEmail}" to subscriber list. Welcome email dispatched.`,
        });
        setManualEmail("");
        setIsAddModalOpen(false);
      } else {
        setNotification({
          type: "error",
          text: res.message || "Failed to register subscriber.",
        });
      }
    } catch {
      setNotification({ type: "error", text: "Failed to connect to server." });
    } finally {
      setIsAdding(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Copy Email Helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotification({ type: "success", text: `Copied "${text}" to clipboard.` });
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
      {/* Top Banner Alert Notification */}
      {notification && (
        <div
          className={`p-4 rounded-sm border text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              name={notification.type === "success" ? "check" : "alert-circle"}
              size={16}
              className={notification.type === "success" ? "text-emerald-600" : "text-red-600"}
            />
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-ink-soft hover:text-ink cursor-pointer"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-sm border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[11px] font-bold uppercase tracking-wider">
            <Icon name="mail" size={13} />
            <span>Audience & Communications</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900">
            Newsletter Subscribers
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft">
            All prospective learners and professionals who subscribed via the college footer, checkout, or consultation pages. Each new subscriber receives an auto-reply welcome message with discount code <span className="font-mono font-bold text-navy-900 bg-gold-100/60 px-1.5 py-0.5 rounded-xs">WELCOME5</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-sm bg-paper hover:bg-white text-navy-900 border border-line text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Icon name="plus" size={14} className="text-gold-600" />
            <span>Add Subscriber</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={subscribers.length === 0}
            className="px-4 py-2.5 rounded-sm bg-navy-900 hover:bg-navy-800 disabled:opacity-40 text-gold-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Icon name="download" size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-sm border border-line shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider block">
            Total Registry
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-extrabold text-navy-900 block">
            {totalCount}
          </span>
          <span className="text-[11px] text-ink-soft">Subscribed contacts on record</span>
        </div>

        <div className="p-4 bg-white rounded-sm border border-line shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider block">
            Active Subscribers
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-700 block">
              {activeCount}
            </span>
            {totalCount > 0 && (
              <span className="text-[11px] font-bold text-emerald-600 font-mono">
                {Math.round((activeCount / totalCount) * 100)}%
              </span>
            )}
          </div>
          <span className="text-[11px] text-emerald-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Receiving qualification alerts
          </span>
        </div>

        <div className="p-4 bg-white rounded-sm border border-line shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider block">
            Unsubscribed
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-extrabold text-ink-soft block">
            {unsubscribedCount}
          </span>
          <span className="text-[11px] text-ink-soft">Opted out from marketing</span>
        </div>

        <div className="p-4 bg-white rounded-sm border border-line shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider block">
            Welcome Codes Issued
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-extrabold text-navy-900 block">
            {activeCount}
          </span>
          <span className="text-[11px] text-gold-700 font-mono font-semibold">
            WELCOME5 (5% tuition discount)
          </span>
        </div>
      </div>

      {/* Search, Filter & Action Toolbar */}
      <div className="bg-white rounded-sm border border-line p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex-1 relative">
          <Icon
            name="search"
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subscribers by email address or source..."
            className="w-full pl-9 pr-4 py-2 border border-line rounded-xs text-xs focus:outline-none focus:border-navy-900 bg-paper/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xs border border-line bg-paper p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
                statusFilter === "all"
                  ? "bg-navy-900 text-white font-bold"
                  : "text-ink-soft hover:text-navy-900"
              }`}
            >
              All ({subscribers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
                statusFilter === "active"
                  ? "bg-navy-900 text-white font-bold"
                  : "text-ink-soft hover:text-navy-900"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("unsubscribed")}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
                statusFilter === "unsubscribed"
                  ? "bg-navy-900 text-white font-bold"
                  : "text-ink-soft hover:text-navy-900"
              }`}
            >
              Unsubscribed ({unsubscribedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Subscribers Table Card */}
      <div className="bg-white rounded-sm border border-line shadow-2xs overflow-hidden">
        {filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-paper border border-line text-ink-soft mx-auto flex items-center justify-center">
              <Icon name="mail" size={22} />
            </div>
            <h3 className="font-heading text-lg font-bold text-navy-900">
              No subscriber records found
            </h3>
            <p className="text-xs text-ink-soft max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? `No results match the query "${searchQuery}". Try adjusting your keywords or clearing the filter.`
                : "Your subscriber list is currently clean. When visitors enter their email into the website footer, their record and welcome email delivery will appear here automatically."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-navy-900 font-bold hover:underline cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper border-b border-line text-ink-soft uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Subscriber Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Subscribed Date</th>
                  <th className="py-3 px-4">Source Page</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredSubscribers.map((sub, index) => {
                  const dateStr = new Date(sub.subscribedAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-paper/40 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-ink-soft">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy-900 text-xs">
                            {sub.email}
                          </span>
                          <button
                            type="button"
                            title="Copy email"
                            onClick={() => handleCopy(sub.email)}
                            className="text-ink-soft hover:text-navy-900 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                          >
                            <Icon name="copy" size={12} />
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-ink-soft block mt-0.5">
                          ID: {sub.id}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {sub.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Unsubscribed</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-ink-soft text-xs whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 bg-paper rounded-xs border border-line text-ink">
                          {sub.source || "website_footer"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(sub.id)}
                            disabled={isPending}
                            className={`px-2.5 py-1 rounded-xs border text-[11px] font-semibold transition-all cursor-pointer ${
                              sub.status === "active"
                                ? "border-amber-300 text-amber-800 hover:bg-amber-50"
                                : "border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                            }`}
                          >
                            {sub.status === "active" ? "Mark Unsubscribed" : "Re-activate"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(sub.id, sub.email)}
                            disabled={isPending}
                            title="Delete Subscriber"
                            className="p-1 rounded-xs text-ink-soft hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                          >
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Add Subscriber Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-sm border border-line p-6 max-w-md w-full space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-navy-900 text-gold-300 flex items-center justify-center">
                  <Icon name="user" size={14} />
                </div>
                <strong className="text-sm font-bold text-navy-900">
                  Add Newsletter Subscriber
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-ink-soft hover:text-navy-900 cursor-pointer"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <p className="text-xs text-ink-soft leading-relaxed">
              Add a student or applicant directly to the mailing list. The system will save their record and dispatch the official Welcome Email containing their <span className="font-bold text-navy-900">WELCOME5</span> discount voucher.
            </p>

            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Subscriber Email Address
                </label>
                <input
                  type="email"
                  required
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="e.g. learner@example.co.uk"
                  className="w-full px-3 py-2 border border-line rounded-xs text-xs focus:outline-none focus:border-navy-900 bg-paper/30 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xs border border-line text-xs font-semibold hover:bg-paper cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-5 py-2 rounded-xs bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-gold-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isAdding ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-gold-300/30 border-t-gold-300 rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={13} />
                      <span>Register Subscriber</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
