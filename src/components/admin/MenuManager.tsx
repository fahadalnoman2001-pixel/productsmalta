"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit2,
  MoveUp,
  MoveDown,
  ExternalLink,
  RotateCcw,
  Check,
  X,
  Compass,
  Link as LinkIcon,
  Sparkles,
  Layers,
  Boxes,
  FileText,
  Eye,
  EyeOff
} from "lucide-react";

export type MenuItemData = {
  id: string;
  label: string;
  url: string;
  location: string;
  order: number;
  target: string;
  badge?: string | null;
  badgeColor?: string | null;
  isHighlighted: boolean;
  isActive: boolean;
  parentId?: string | null;
};

interface MenuManagerProps {
  initialItems: MenuItemData[];
  categories: { id: string; name: string; slug: string }[];
  collections: { id: string; name: string; slug: string }[];
}

const PRESET_PAGES = [
  { label: "Home", url: "/" },
  { label: "All Products", url: "/products" },
  { label: "Blog & Guides", url: "/blog" },
  { label: "About Us", url: "/about" },
  { label: "Contact Us", url: "/contact" },
  { label: "Privacy Policy", url: "/privacy" },
  { label: "Terms of Service", url: "/terms" }
];

const BADGE_COLORS = [
  { label: "Red (Fire/Sale)", value: "red", bg: "bg-red-500", text: "text-white" },
  { label: "Orange (Brand)", value: "orange", bg: "bg-brand-500", text: "text-white" },
  { label: "Amber (Warning/Hot)", value: "amber", bg: "bg-amber-500", text: "text-white" },
  { label: "Emerald (New/Fresh)", value: "emerald", bg: "bg-emerald-500", text: "text-white" },
  { label: "Purple (Special)", value: "purple", bg: "bg-purple-500", text: "text-white" },
  { label: "Slate (Neutral)", value: "slate", bg: "bg-slate-700", text: "text-white" }
];

export default function MenuManager({ initialItems, categories, collections }: MenuManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState<MenuItemData[]>(initialItems);
  const [activeTab, setActiveTab] = useState<"main" | "topbar" | "footer">("main");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    label: "",
    url: "",
    location: "main",
    target: "_self",
    badge: "",
    badgeColor: "red",
    isHighlighted: false,
    isActive: true
  });

  function showNotice(type: "success" | "error", message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  }

  const currentItems = items
    .filter(i => i.location === activeTab)
    .sort((a, b) => a.order - b.order);

  function openCreateModal() {
    setEditingItem(null);
    setFormData({
      label: "",
      url: "",
      location: activeTab,
      target: "_self",
      badge: "",
      badgeColor: "red",
      isHighlighted: false,
      isActive: true
    });
    setIsModalOpen(true);
  }

  function openEditModal(item: MenuItemData) {
    setEditingItem(item);
    setFormData({
      label: item.label,
      url: item.url,
      location: item.location,
      target: item.target || "_self",
      badge: item.badge || "",
      badgeColor: item.badgeColor || "red",
      isHighlighted: item.isHighlighted,
      isActive: item.isActive
    });
    setIsModalOpen(true);
  }

  function handlePresetSelect(presetType: string, val: string) {
    if (!val) return;
    if (presetType === "page") {
      const p = PRESET_PAGES.find(x => x.url === val);
      if (p) {
        setFormData(prev => ({ ...prev, label: p.label, url: p.url }));
      }
    } else if (presetType === "category") {
      const c = categories.find(x => x.slug === val);
      if (c) {
        setFormData(prev => ({ ...prev, label: c.name, url: `/products?category=${c.slug}` }));
      }
    } else if (presetType === "collection") {
      const col = collections.find(x => x.slug === val);
      if (col) {
        setFormData(prev => ({
          ...prev,
          label: col.name,
          url: `/products?collection=${col.slug}`,
          isHighlighted: col.slug.includes("sale") || col.slug.includes("deal")
        }));
      }
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.label.trim() || !formData.url.trim()) {
      showNotice("error", "Please provide a label and URL.");
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        // Update
        const res = await fetch(`/api/menus?id=${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error("Failed to update menu item");
        const updated = await res.json();
        setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
        showNotice("success", `Updated "${updated.label}" successfully!`);
      } else {
        // Create
        const res = await fetch("/api/menus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error("Failed to create menu item");
        const created = await res.json();
        setItems(prev => [...prev, created]);
        showNotice("success", `Added "${created.label}" successfully!`);
      }
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      showNotice("error", err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Are you sure you want to delete "${label}" from the menu?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/menus?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete menu item");
      setItems(prev => prev.filter(i => i.id !== id));
      showNotice("success", `Deleted "${label}" successfully!`);
      router.refresh();
    } catch (err: any) {
      showNotice("error", err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(item: MenuItemData) {
    const nextState = !item.isActive;
    try {
      const res = await fetch(`/api/menus?id=${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextState })
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      const updated = await res.json();
      setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      showNotice("success", `Menu item ${nextState ? "activated" : "hidden"}`);
      router.refresh();
    } catch (err: any) {
      showNotice("error", err.message || "Failed to toggle status");
    }
  }

  async function moveItem(index: number, direction: "up" | "down") {
    const list = [...currentItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap in array
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Reassign orders
    const updatedList = list.map((item, idx) => ({ ...item, order: idx }));
    const otherItems = items.filter(i => i.location !== activeTab);
    setItems([...otherItems, ...updatedList]);

    try {
      await fetch("/api/menus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedList.map(item => ({ id: item.id, order: item.order }))
        })
      });
      showNotice("success", "Menu order updated!");
      router.refresh();
    } catch {
      showNotice("error", "Failed to save order on server");
    }
  }

  async function handleSeedDefaults(replace: boolean = false) {
    const msg = replace
      ? "This will replace all current menu items with the standard site navigation. Continue?"
      : "Initialize default menu items based on your categories and standard pages?";
    if (!confirm(msg)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/menus/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replace })
      });
      if (!res.ok) throw new Error("Failed to seed menu items");
      const data = await res.json();
      showNotice("success", `Initialized ${data.count} default menu items!`);
      // Reload updated items
      const fetchRes = await fetch("/api/menus");
      const freshItems = await fetchRes.json();
      setItems(freshItems);
      router.refresh();
    } catch (err: any) {
      showNotice("error", err.message || "Failed to initialize defaults");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium flex items-center gap-2 transition-all animate-bounce ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {notification.type === "success" ? <Check size={18} /> : <X size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
              <Compass size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Menu Control</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Customize and manage your website navigation links, order, badges, and topbar items.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleSeedDefaults(items.length > 0)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            title="Populate or reset standard links"
          >
            <RotateCcw size={14} />
            <span>{items.length === 0 ? "Seed Default Menus" : "Reset to Defaults"}</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition"
          >
            <Plus size={16} />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Location Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab("main")}
          className={`py-3.5 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === "main"
              ? "border-brand-600 text-brand-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Main Header Navigation</span>
          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
            {items.filter(i => i.location === "main").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("topbar")}
          className={`py-3.5 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === "topbar"
              ? "border-brand-600 text-brand-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Top Utility Strip</span>
          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
            {items.filter(i => i.location === "topbar").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("footer")}
          className={`py-3.5 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === "footer"
              ? "border-brand-600 text-brand-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Footer Menu</span>
          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
            {items.filter(i => i.location === "footer").length}
          </span>
        </button>
      </div>

      {/* Menu Item Table / List */}
      <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-xs overflow-hidden">
        {currentItems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Compass size={24} />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No menu items configured for this location</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add custom links, categories, or collections, or click below to initialize standard navigation items.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={openCreateModal}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-brand-500 hover:bg-brand-600 transition"
              >
                + Add Item
              </button>
              <button
                onClick={() => handleSeedDefaults(false)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Seed Defaults
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <div className="bg-slate-50/75 px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1 text-center">Order</div>
              <div className="col-span-4">Label & Badges</div>
              <div className="col-span-4">Target URL</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {currentItems.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === currentItems.length - 1;
              return (
                <div
                  key={item.id}
                  className={`px-6 py-3.5 grid grid-cols-12 gap-4 items-center transition hover:bg-slate-50/60 ${
                    !item.isActive ? "opacity-60 bg-slate-50/30" : ""
                  }`}
                >
                  {/* Order & Move Buttons */}
                  <div className="col-span-1 flex items-center justify-center gap-1">
                    <button
                      onClick={() => moveItem(index, "up")}
                      disabled={isFirst}
                      title="Move Up"
                      className={`p-1 rounded hover:bg-slate-200 transition ${
                        isFirst ? "text-slate-300 cursor-not-allowed" : "text-slate-600"
                      }`}
                    >
                      <MoveUp size={14} />
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-500 w-4 text-center">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => moveItem(index, "down")}
                      disabled={isLast}
                      title="Move Down"
                      className={`p-1 rounded hover:bg-slate-200 transition ${
                        isLast ? "text-slate-300 cursor-not-allowed" : "text-slate-600"
                      }`}
                    >
                      <MoveDown size={14} />
                    </button>
                  </div>

                  {/* Label & Details */}
                  <div className="col-span-4 flex items-center gap-2 min-w-0">
                    <span className={`text-sm font-semibold truncate ${item.isHighlighted ? "text-brand-600" : "text-slate-800"}`}>
                      {item.label}
                    </span>

                    {item.badge && (
                      <span
                        className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-sm shadow-xs ${
                          item.badgeColor === "red"
                            ? "bg-red-500 text-white"
                            : item.badgeColor === "emerald"
                            ? "bg-emerald-500 text-white"
                            : item.badgeColor === "amber"
                            ? "bg-amber-500 text-white"
                            : item.badgeColor === "purple"
                            ? "bg-purple-500 text-white"
                            : "bg-brand-500 text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.isHighlighted && (
                      <span className="text-amber-500" title="Highlighted Item">
                        <Sparkles size={14} />
                      </span>
                    )}
                  </div>

                  {/* URL */}
                  <div className="col-span-4 flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-mono text-slate-600 truncate bg-slate-100 px-2 py-0.5 rounded">
                      {item.url}
                    </span>
                    {item.target === "_blank" && (
                      <span title="Opens in new tab" className="text-slate-400">
                        <ExternalLink size={12} />
                      </span>
                    )}
                  </div>

                  {/* Active / Inactive Toggle */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => toggleActive(item)}
                      className={`p-1.5 rounded-md transition ${
                        item.isActive
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      }`}
                      title={item.isActive ? "Active (click to hide)" : "Hidden (click to show)"}
                    >
                      {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition"
                      title="Edit Item"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.label)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                      title="Delete Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Preview Box */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Compass size={14} className="text-brand-600" />
          <span>Live Header Menu Simulation</span>
        </h2>
        <div className="bg-slate-900 text-slate-300 text-xs px-4 py-2 rounded-t-lg flex items-center justify-between border-b border-slate-800">
          <div className="text-[11px] text-slate-400">Top Utility Strip:</div>
          <div className="flex items-center gap-4">
            {items
              .filter(i => i.location === "topbar" && i.isActive)
              .map(i => (
                <span key={i.id} className="text-slate-300 hover:text-white">
                  {i.label}
                </span>
              ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-b-lg p-3 flex flex-wrap items-center gap-1 text-sm">
          <div className="bg-brand-500 text-white font-semibold px-3 py-1 rounded text-xs">
            All Categories ▾
          </div>
          {items
            .filter(i => i.location === "main" && i.isActive)
            .map(i => (
              <span
                key={i.id}
                className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 ${
                  i.isHighlighted
                    ? "text-sale-500 font-bold bg-amber-50"
                    : "text-slate-700 hover:text-brand-600"
                }`}
              >
                {i.label}
                {i.badge && (
                  <span
                    className={`text-[9px] uppercase font-bold px-1 rounded ${
                      i.badgeColor === "red" ? "bg-red-500 text-white" : "bg-brand-500 text-white"
                    }`}
                  >
                    {i.badge}
                  </span>
                )}
              </span>
            ))}
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-brand-50 rounded-md text-brand-600">
                  <Compass size={18} />
                </div>
                <h2 className="font-bold text-slate-800 text-base">
                  {editingItem ? `Edit "${editingItem.label}"` : "Add Menu Item"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-sm">
              {/* Quick Presets */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={13} className="text-brand-600" />
                  <span>Quick Presets (Auto-fill Label & URL)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                      <FileText size={11} /> Standard Pages
                    </label>
                    <select
                      onChange={e => handlePresetSelect("page", e.target.value)}
                      defaultValue=""
                      className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700 focus:outline-brand-500"
                    >
                      <option value="" disabled>
                        Pick a page...
                      </option>
                      {PRESET_PAGES.map(p => (
                        <option key={p.url} value={p.url}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                      <Layers size={11} /> Categories
                    </label>
                    <select
                      onChange={e => handlePresetSelect("category", e.target.value)}
                      defaultValue=""
                      className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700 focus:outline-brand-500"
                    >
                      <option value="" disabled>
                        Pick category...
                      </option>
                      {categories.map(c => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                      <Boxes size={11} /> Collections
                    </label>
                    <select
                      onChange={e => handlePresetSelect("collection", e.target.value)}
                      defaultValue=""
                      className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700 focus:outline-brand-500"
                    >
                      <option value="" disabled>
                        Pick collection...
                      </option>
                      {collections.map(col => (
                        <option key={col.id} value={col.slug}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Label & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.label}
                    onChange={e => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g. Electronics, 🔥 Deals"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination URL / Path <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <LinkIcon size={14} />
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.url}
                      onChange={e => setFormData({ ...formData, url: e.target.value })}
                      placeholder="/products, https://..."
                      className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Menu Location</label>
                  <select
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="main">Main Header Navigation</option>
                    <option value="topbar">Top Utility Strip</option>
                    <option value="footer">Footer Menu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Window</label>
                  <select
                    value={formData.target}
                    onChange={e => setFormData({ ...formData, target: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="_self">Same tab (_self)</option>
                    <option value="_blank">New tab (_blank)</option>
                  </select>
                </div>
              </div>

              {/* Badge text & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Badge Pill (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. HOT, SALE, NEW"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Color</label>
                  <select
                    value={formData.badgeColor}
                    onChange={e => setFormData({ ...formData, badgeColor: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {BADGE_COLORS.map(c => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isHighlighted}
                    onChange={e => setFormData({ ...formData, isHighlighted: e.target.checked })}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Highlight styling (bold / accent colored)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Active & Visible</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingItem ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
