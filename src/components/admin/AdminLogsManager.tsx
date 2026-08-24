"use client";

import { useState } from "react";
import {
  History,
  Search,
  RefreshCw,
  Trash2,
  Filter,
  User,
  Shield,
  Activity,
  Calendar,
  Globe,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  FileCode,
  Info
} from "lucide-react";

interface AdminLogItem {
  id: string;
  adminId: string | null;
  adminEmail: string;
  adminName: string | null;
  action: string;
  details: string | null;
  target: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string | Date;
}

export default function AdminLogsManager({
  initialLogs,
  initialTotal,
  initialPage,
  initialTotalPages,
  availableActions,
  availableAdmins,
  userRole
}: {
  initialLogs: AdminLogItem[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  availableActions: string[];
  availableAdmins: string[];
  userRole?: string | null;
}) {
  const [logs, setLogs] = useState<AdminLogItem[]>(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [adminFilter, setAdminFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AdminLogItem | null>(null);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function showMessage(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  }

  async function fetchLogs(targetPage = page, targetAction = actionFilter, targetAdmin = adminFilter, targetSearch = search) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", targetPage.toString());
      params.set("limit", "25");
      if (targetAction !== "ALL") params.set("action", targetAction);
      if (targetAdmin !== "ALL") params.set("adminEmail", targetAdmin);
      if (targetSearch.trim()) params.set("search", targetSearch.trim());

      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      } else {
        throw new Error(data.error || "Failed to load logs");
      }
    } catch (err: any) {
      showMessage("error", err?.message || "Error fetching admin logs");
    } finally {
      setLoading(false);
    }
  }

  async function handleClearAllLogs() {
    if (!confirm("Are you sure you want to clear all admin audit logs? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/logs", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to clear logs");
      showMessage("success", "Audit logs cleared successfully");
      await fetchLogs(1);
    } catch (err: any) {
      showMessage("error", err?.message || "Failed to clear logs");
    } finally {
      setLoading(false);
    }
  }

  // Format action badge color
  function getActionBadge(action: string) {
    const act = action.toUpperCase();
    if (act.includes("CREATE")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (act.includes("PASSWORD")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (act.includes("DELETE") || act.includes("REMOVE")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (act.includes("UPDATE") || act.includes("EDIT")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (act.includes("LOGIN")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  }

  function formatTimeAgo(dateStr: string | Date) {
    const d = new Date(dateStr);
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium shadow-md transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <History className="text-brand-600" size={24} />
            <h1 className="text-2xl font-bold text-slate-900 font-display">Admin Logs</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Real-time audit records of administrative actions, credential changes, and system modifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLogs(page)}
            disabled={loading}
            className="btn btn-secondary inline-flex items-center gap-1.5 text-xs font-semibold py-2"
            title="Refresh logs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          {userRole === "super_admin" && total > 0 && (
            <button
              onClick={handleClearAllLogs}
              disabled={loading}
              className="btn bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 text-xs font-semibold py-2"
              title="Clear all audit logs"
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") fetchLogs(1, actionFilter, adminFilter, search);
            }}
            placeholder="Search details, target, admin email, IP..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={e => {
              setActionFilter(e.target.value);
              fetchLogs(1, e.target.value, adminFilter, search);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 flex-1 sm:flex-none"
          >
            <option value="ALL">All Actions</option>
            {availableActions.map(act => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          {/* Admin Email Filter */}
          <select
            value={adminFilter}
            onChange={e => {
              setAdminFilter(e.target.value);
              fetchLogs(1, actionFilter, e.target.value, search);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 flex-1 sm:flex-none"
          >
            <option value="ALL">All Admins</option>
            {availableAdmins.map(email => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
          </select>

          {/* Search Trigger */}
          <button
            onClick={() => fetchLogs(1, actionFilter, adminFilter, search)}
            className="btn btn-primary text-xs py-2 px-3.5 font-bold shadow-xs whitespace-nowrap"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-4">Admin</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target</th>
                <th className="py-3.5 px-4">Details</th>
                <th className="py-3.5 px-5 text-right">Client Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Activity size={32} className="mx-auto mb-2 text-slate-300" />
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                logs.map(log => {
                  const badgeClass = getActionBadge(log.action);
                  const isRecent = Date.now() - new Date(log.createdAt).getTime() < 3600000;

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      {/* Timestamp */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                          <Clock size={13} className="text-slate-400" />
                          <span>
                            {new Date(log.createdAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          {isRecent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {formatTimeAgo(log.createdAt)} ·{" "}
                          {new Date(log.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric"
                          })}
                        </div>
                      </td>

                      {/* Admin User */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 text-xs">
                          {log.adminName || log.adminEmail.split("@")[0]}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {log.adminEmail}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeClass}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="py-4 px-4 text-xs font-medium text-slate-700 max-w-[180px] truncate">
                        {log.target || "—"}
                      </td>

                      {/* Details Preview */}
                      <td className="py-4 px-4 text-xs text-slate-500 max-w-[220px] truncate">
                        {log.details || "—"}
                      </td>

                      {/* Client IP */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Globe size={11} className="text-slate-400" />
                          {log.ip || "127.0.0.1"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
            <div className="text-xs text-slate-500 font-medium">
              Showing page <span className="font-bold text-slate-800">{page}</span> of{" "}
              <span className="font-bold text-slate-800">{totalPages}</span> ({total} total logs)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page <= 1 || loading}
                className="btn btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <button
                onClick={() => fetchLogs(page + 1)}
                disabled={page >= totalPages || loading}
                className="btn btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED LOG INSPECTOR MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Info className="text-brand-600" size={20} />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">Log Details</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Action</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedLog.action}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Timestamp</div>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Admin Email</div>
                  <div className="font-mono text-slate-900 mt-0.5">{selectedLog.adminEmail}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Target</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedLog.target || "N/A"}</div>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-700 uppercase text-[10px] mb-1">Payload / Details</div>
                <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre-wrap max-h-48">
                  {selectedLog.details || "No additional payload recorded."}
                </pre>
              </div>

              {selectedLog.userAgent && (
                <div>
                  <div className="font-bold text-slate-400 uppercase text-[10px]">User Agent</div>
                  <div className="font-mono text-[11px] text-slate-600 break-all bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-0.5">
                    {selectedLog.userAgent}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="btn btn-secondary text-xs px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
