"use client";
import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough, Heading2, Heading3,
  List, ListOrdered, Quote, Link2, Link2Off, Image as ImageIcon,
  Upload, Code, Undo, Redo, Eraser, AlignLeft, AlignCenter
} from "lucide-react";

/**
 * Lightweight WYSIWYG editor (contentEditable + execCommand).
 * Outputs HTML via onChange. Supports internal & external links and images
 * (by URL or file upload to /api/upload).
 */
export default function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [imgOpen, setImgOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [imgAlt, setImgAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const savedRange = useRef<Range | null>(null);

  // Initialise content once
  useEffect(() => {
    if (ref.current && value && ref.current.innerHTML.trim() === "") {
      ref.current.innerHTML = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emit() { if (ref.current) onChange(ref.current.innerHTML); }

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0);
  }
  function restoreSelection() {
    const sel = window.getSelection();
    if (sel && savedRange.current) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
  }

  function cmd(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  }
  function formatBlock(tag: string) {
    ref.current?.focus();
    document.execCommand("formatBlock", false, tag);
    emit();
  }

  function openLink() {
    saveSelection();
    const sel = window.getSelection();
    setLinkText(sel && !sel.isCollapsed ? sel.toString() : "");
    setLinkUrl(""); setLinkOpen(true);
  }
  function insertLink() {
    restoreSelection();
    const url = linkUrl.trim();
    if (!url) return;
    const text = linkText.trim() || url;
    const rel = linkNewTab ? ` target="_blank" rel="noopener noreferrer"` : "";
    const html = `<a href="${url}"${rel}>${text}</a>`;
    document.execCommand("insertHTML", false, html);
    setLinkOpen(false); setLinkUrl(""); setLinkText(""); emit();
  }

  function openImage() { saveSelection(); setImgUrl(""); setImgAlt(""); setImgOpen(true); }
  function insertImageUrl() {
    restoreSelection();
    const url = imgUrl.trim();
    if (!url) return;
    document.execCommand("insertHTML", false, `<img src="${url}" alt="${imgAlt}" />`);
    setImgOpen(false); emit();
  }
  async function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (j.url) {
        restoreSelection();
        ref.current?.focus();
        document.execCommand("insertHTML", false, `<img src="${j.url}" alt="${file.name}" />`);
        emit();
      } else alert(j.error || "Upload failed");
    } catch { alert("Upload failed"); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  const Btn = ({ onClick, title, children }: any) => (
    <button type="button" onMouseDown={e => e.preventDefault()} onClick={onClick} title={title}
      className="h-8 w-8 grid place-items-center rounded hover:bg-ink-100 text-ink-700">
      {children}
    </button>
  );
  const Sep = () => <span className="w-px h-5 bg-ink-200 mx-1" />;

  return (
    <div className="border border-ink-200 rounded-md overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-ink-100 bg-ink-50 px-2 py-1">
        <Btn onClick={() => cmd("bold")} title="Bold"><Bold size={16} /></Btn>
        <Btn onClick={() => cmd("italic")} title="Italic"><Italic size={16} /></Btn>
        <Btn onClick={() => cmd("underline")} title="Underline"><Underline size={16} /></Btn>
        <Btn onClick={() => cmd("strikeThrough")} title="Strikethrough"><Strikethrough size={16} /></Btn>
        <Sep />
        <Btn onClick={() => formatBlock("<h2>")} title="Heading 2"><Heading2 size={16} /></Btn>
        <Btn onClick={() => formatBlock("<h3>")} title="Heading 3"><Heading3 size={16} /></Btn>
        <Btn onClick={() => formatBlock("<blockquote>")} title="Quote"><Quote size={16} /></Btn>
        <Btn onClick={() => formatBlock("<pre>")} title="Code block"><Code size={16} /></Btn>
        <Sep />
        <Btn onClick={() => cmd("insertUnorderedList")} title="Bullet list"><List size={16} /></Btn>
        <Btn onClick={() => cmd("insertOrderedList")} title="Numbered list"><ListOrdered size={16} /></Btn>
        <Btn onClick={() => cmd("justifyLeft")} title="Align left"><AlignLeft size={16} /></Btn>
        <Btn onClick={() => cmd("justifyCenter")} title="Align center"><AlignCenter size={16} /></Btn>
        <Sep />
        <Btn onClick={openLink} title="Insert link"><Link2 size={16} /></Btn>
        <Btn onClick={() => cmd("unlink")} title="Remove link"><Link2Off size={16} /></Btn>
        <Btn onClick={openImage} title="Insert image by URL"><ImageIcon size={16} /></Btn>
        <Btn onClick={() => { saveSelection(); fileRef.current?.click(); }} title="Upload image">
          {uploading ? <span className="text-[10px]">…</span> : <Upload size={16} />}
        </Btn>
        <Sep />
        <Btn onClick={() => cmd("removeFormat")} title="Clear formatting"><Eraser size={16} /></Btn>
        <Btn onClick={() => cmd("undo")} title="Undo"><Undo size={16} /></Btn>
        <Btn onClick={() => cmd("redo")} title="Redo"><Redo size={16} /></Btn>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFilePicked} />
      </div>

      {/* Link popover */}
      {linkOpen && (
        <div className="border-b border-ink-100 bg-brand-50 p-3 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input className="input" placeholder="Link text" value={linkText} onChange={e => setLinkText(e.target.value)} />
            <input className="input" placeholder="URL — external (https://…) or internal (/products/slug)" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1 text-xs text-ink-600"><input type="checkbox" checked={linkNewTab} onChange={e => setLinkNewTab(e.target.checked)} /> Open in new tab (use for external / affiliate)</label>
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={() => setLinkOpen(false)} className="btn-ghost text-xs">Cancel</button>
              <button type="button" onClick={insertLink} className="btn-primary text-xs">Insert Link</button>
            </div>
          </div>
          <p className="text-[11px] text-ink-500">Tip: internal link = path like <code>/blog/my-post</code> or <code>/products/wireless-headphones</code>. External = full <code>https://…</code> URL.</p>
        </div>
      )}

      {/* Image-by-URL popover */}
      {imgOpen && (
        <div className="border-b border-ink-100 bg-brand-50 p-3 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input className="input" placeholder="Image URL (https://…)" value={imgUrl} onChange={e => setImgUrl(e.target.value)} />
            <input className="input" placeholder="Alt text (for SEO)" value={imgAlt} onChange={e => setImgAlt(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setImgOpen(false)} className="btn-ghost text-xs">Cancel</button>
            <button type="button" onClick={insertImageUrl} className="btn-primary text-xs">Insert Image</button>
          </div>
        </div>
      )}

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder="Write your blog content here…"
        className="blog-content min-h-[360px] max-h-[640px] overflow-auto px-4 py-3 focus:outline-none text-ink-800"
      />
    </div>
  );
}
