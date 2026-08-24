"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldAlert
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string | Date;
}

const PRIMARY_SUPER_ADMIN_EMAIL = "fahadalnoman2001@gmail.com";

export default function AdminManager({
  initialUsers,
  currentUserEmail
}: {
  initialUsers: AdminUser[];
  currentUserEmail?: string | null;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  // Create form state
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState("admin");
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("admin");

  // Password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function showMessage(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 5000);
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      }
    } catch (err: any) {
      showMessage("error", err?.message || "Failed to refresh admin list");
    } finally {
      setLoading(false);
    }
  }

  // Handle Create Admin
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createEmail.trim() || !createPassword.trim()) {
      showMessage("error", "Email and password are required");
      return;
    }
    if (createPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          email: createEmail.trim(),
          password: createPassword,
          role: createRole
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create admin");
      }

      showMessage("success", data.message || "Admin created successfully");
      setIsCreateOpen(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("admin");
      await fetchUsers();
      router.refresh();
    } catch (err: any) {
      showMessage("error", err?.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  }

  // Handle Edit Admin (Name, Email, Role)
  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    if (!editEmail.trim()) {
      showMessage("error", "Email cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          name: editName.trim(),
          email: editEmail.trim(),
          role: editRole
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update admin");
      }

      showMessage("success", data.message || "Admin updated successfully");
      setEditingUser(null);
      await fetchUsers();
      router.refresh();
    } catch (err: any) {
      showMessage("error", err?.message || "Failed to update admin");
    } finally {
      setLoading(false);
    }
  }

  // Handle Change Password
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordUser) return;
    if (!newPassword || newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage("error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: passwordUser.id,
          password: newPassword
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      showMessage("success", `Password updated for ${passwordUser.email}`);
      setPasswordUser(null);
      setNewPassword("");
      setConfirmPassword("");
      await fetchUsers();
      router.refresh();
    } catch (err: any) {
      showMessage("error", err?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  // Handle Delete Admin
  async function handleDelete() {
    if (!deleteUser) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/admins?id=${deleteUser.id}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete admin");
      }

      showMessage("success", data.message || "Admin deleted successfully");
      setDeleteUser(null);
      await fetchUsers();
      router.refresh();
    } catch (err: any) {
      showMessage("error", err?.message || "Failed to delete admin");
    } finally {
      setLoading(false);
    }
  }

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const superAdminsCount = users.filter(u => u.role === "super_admin").length;
  const regularAdminsCount = users.filter(u => u.role === "admin" || u.role === "editor").length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium shadow-md transition-all animate-in fade-in slide-in-from-top-2 ${
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
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-brand-600" size={24} />
            <h1 className="text-2xl font-bold text-slate-900 font-display">Admin Management</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Manage administrator accounts, assign permissions, change passwords and update emails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="btn btn-secondary inline-flex items-center gap-1.5 text-xs font-semibold py-2"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setCreateName("");
              setCreateEmail("");
              setCreatePassword("");
              setCreateRole("admin");
              setIsCreateOpen(true);
            }}
            className="btn btn-primary inline-flex items-center gap-2 text-xs font-bold py-2 shadow-sm"
          >
            <UserPlus size={16} />
            <span>Add New Admin</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{users.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Administrators
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <KeyRound size={24} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{superAdminsCount}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Super Admins
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <UserIcon size={24} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{regularAdminsCount}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Admins & Editors
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Roles</option>
            <option value="super_admin">Super Admins</option>
            <option value="admin">Admins</option>
            <option value="editor">Editors</option>
          </select>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Admin User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No administrators found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isPrimarySuperAdmin = user.email === PRIMARY_SUPER_ADMIN_EMAIL;
                  const isSelf = user.email === currentUserEmail;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Email */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {(user.name || user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              <span>{user.name || "Administrator"}</span>
                              {isSelf && (
                                <span className="text-[10px] font-extrabold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                              {isPrimarySuperAdmin && (
                                <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                                  Primary Root
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        {user.role === "super_admin" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <ShieldCheck size={12} />
                            Super Admin
                          </span>
                        ) : user.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <ShieldCheck size={12} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            Editor
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-4 text-xs text-slate-500 font-medium">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Change Password */}
                          <button
                            onClick={() => {
                              setPasswordUser(user);
                              setNewPassword("");
                              setConfirmPassword("");
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                            title="Change password"
                          >
                            <KeyRound size={13} className="text-slate-600" />
                            <span className="hidden sm:inline">Password</span>
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setEditName(user.name || "");
                              setEditEmail(user.email);
                              setEditRole(user.role);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                            title="Edit email / name / role"
                          >
                            <Edit3 size={13} className="text-slate-600" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          {/* Delete Admin */}
                          {!isPrimarySuperAdmin && !isSelf && (
                            <button
                              onClick={() => setDeleteUser(user)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                              title="Delete admin"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ADMIN MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="text-brand-600" size={20} />
                <h3 className="text-lg font-bold text-slate-900 font-display">Create Another Admin</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Admin Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={createName}
                    onChange={e => setCreateName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="label">Admin Email <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={e => setCreateEmail(e.target.value)}
                    placeholder="admin@youroffers.eu"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="label">Password <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showCreatePassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={createPassword}
                    onChange={e => setCreatePassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Role</label>
                <select
                  value={createRole}
                  onChange={e => setCreateRole(e.target.value)}
                  className="input font-medium"
                >
                  <option value="admin">Admin (Full content & catalog access)</option>
                  <option value="super_admin">Super Admin (Full system & MCP access)</option>
                  <option value="editor">Editor (Content creation only)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary text-xs font-bold shadow-sm"
                >
                  {loading ? "Creating..." : "Create Admin Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN MODAL (NAME, EMAIL, ROLE) */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="text-brand-600" size={20} />
                <h3 className="text-lg font-bold text-slate-900 font-display">Edit Admin Details</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="label">Admin Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="label">Admin Email <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="label">Role</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value)}
                  disabled={editingUser.email === PRIMARY_SUPER_ADMIN_EMAIL}
                  className="input font-medium"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                </select>
                {editingUser.email === PRIMARY_SUPER_ADMIN_EMAIL && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    Primary Super Admin role is protected and cannot be changed.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary text-xs font-bold shadow-sm"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {passwordUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="text-brand-600" size={20} />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">Change Admin Password</h3>
                  <p className="text-xs text-slate-500 font-mono truncate max-w-[280px]">
                    {passwordUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPasswordUser(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="label">New Password <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm New Password <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordUser(null)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary text-xs font-bold shadow-sm"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={24} />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 font-display">Delete Administrator?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently remove <strong className="text-slate-800">{deleteUser.email}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteUser(null)}
                className="btn btn-secondary flex-1 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="btn bg-rose-600 hover:bg-rose-700 text-white flex-1 text-xs font-bold shadow-sm"
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
