"use client";

import { useRef, useEffect, useCallback } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const TOOLBAR_GROUPS = [
  [
    { cmd: "bold",          icon: <><b>B</b></>,              title: "Bold (Ctrl+B)",      cls: "font-bold" },
    { cmd: "italic",        icon: <><i>I</i></>,              title: "Italic (Ctrl+I)",    cls: "italic" },
    { cmd: "underline",     icon: <><u>U</u></>,              title: "Underline (Ctrl+U)", cls: "underline" },
    { cmd: "strikeThrough", icon: <><s>S</s></>,              title: "Strikethrough",      cls: "line-through" },
  ],
  [
    { cmd: "insertUnorderedList", icon: <BulletIcon />,    title: "Bullet List" },
    { cmd: "insertOrderedList",   icon: <NumberedIcon />,  title: "Numbered List" },
  ],
  [
    { cmd: "justifyLeft",   icon: <AlignLeftIcon />,   title: "Align Left" },
    { cmd: "justifyCenter", icon: <AlignCenterIcon />, title: "Align Center" },
    { cmd: "justifyRight",  icon: <AlignRightIcon />,  title: "Align Right" },
  ],
  [
    { cmd: "indent",  icon: <IndentIcon />,   title: "Indent" },
    { cmd: "outdent", icon: <OutdentIcon />,  title: "Outdent" },
  ],
  [
    { cmd: "removeFormat", icon: <ClearIcon />, title: "Hapus Format" },
  ],
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis deskripsi produk di sini...",
  minHeight = "200px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = value || "";
      isInitialized.current = true;
    }
  }, []);

  const execCmd = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val ?? undefined);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  return (
    <div className="overflow-hidden rounded-lg border border-[#bfc9c3] transition-all focus-within:border-[#003527] focus-within:ring-2 focus-within:ring-[#003527]/20">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#e1e3e4] bg-[#f8f9fa] px-2 py-1.5">
        
        {/* Format (Heading) select */}
        <select
          className="mr-1 cursor-pointer rounded border border-[#e1e3e4] bg-white px-2 py-1 text-xs text-[#191c1d] outline-none hover:border-[#bfc9c3]"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              execCmd("formatBlock", e.target.value);
              e.target.value = "";
            }
          }}
        >
          <option value="" disabled>Format</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraf</option>
        </select>

        {/* Font size select */}
        <select
          className="mr-2 cursor-pointer rounded border border-[#e1e3e4] bg-white px-2 py-1 text-xs text-[#191c1d] outline-none hover:border-[#bfc9c3]"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              execCmd("fontSize", e.target.value);
              e.target.value = "";
            }
          }}
        >
          <option value="" disabled>Ukuran</option>
          <option value="1">8pt</option>
          <option value="2">10pt</option>
          <option value="3">12pt</option>
          <option value="4">14pt</option>
          <option value="5">18pt</option>
          <option value="6">24pt</option>
          <option value="7">36pt</option>
        </select>

        {/* Grouped buttons */}
        {TOOLBAR_GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center">
            {gi > 0 && <div className="mx-1 h-4 w-px bg-[#d1d5db]" />}
            {group.map((btn) => (
              <button
                key={btn.cmd}
                type="button"
                title={btn.title}
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCmd(btn.cmd);
                }}
                className="flex h-7 w-7 items-center justify-center rounded text-xs text-[#374151] transition-colors hover:bg-[#e5e7eb] active:bg-[#d1d5db]"
              >
                {btn.icon}
              </button>
            ))}
          </div>
        ))}

        {/* Color picker */}
        <div className="mx-1 h-4 w-px bg-[#d1d5db]" />
        <label title="Warna Teks" className="flex h-7 w-7 cursor-pointer items-center justify-center rounded hover:bg-[#e5e7eb]">
          <span className="relative text-xs font-bold text-[#374151]">
            A
            <span className="absolute -bottom-0.5 left-0 right-0 h-1 rounded-sm bg-red-500" />
          </span>
          <input
            type="color"
            className="absolute h-0 w-0 opacity-0"
            onChange={(e) => execCmd("foreColor", e.target.value)}
          />
        </label>

        {/* Highlight picker */}
        <label title="Sorot Teks" className="flex h-7 w-7 cursor-pointer items-center justify-center rounded hover:bg-[#e5e7eb]">
          <HighlightIcon />
          <input
            type="color"
            className="absolute h-0 w-0 opacity-0"
            defaultValue="#fef08a"
            onChange={(e) => execCmd("hiliteColor", e.target.value)}
          />
        </label>

        {/* Link */}
        <div className="mx-1 h-4 w-px bg-[#d1d5db]" />
        <button
          type="button"
          title="Tambah Link"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = prompt("Masukkan URL:");
            if (url) execCmd("createLink", url);
          }}
          className="flex h-7 w-7 items-center justify-center rounded text-xs text-[#374151] hover:bg-[#e5e7eb]"
        >
          <LinkIcon />
        </button>
        <button
          type="button"
          title="Hapus Link"
          onMouseDown={(e) => { e.preventDefault(); execCmd("unlink"); }}
          className="flex h-7 w-7 items-center justify-center rounded text-xs text-[#374151] hover:bg-[#e5e7eb]"
        >
          <UnlinkIcon />
        </button>

        {/* Undo/Redo */}
        <div className="mx-1 h-4 w-px bg-[#d1d5db]" />
        <button type="button" title="Undo (Ctrl+Z)" onMouseDown={(e) => { e.preventDefault(); execCmd("undo"); }}
          className="flex h-7 w-7 items-center justify-center rounded text-[#374151] hover:bg-[#e5e7eb]">
          <UndoIcon />
        </button>
        <button type="button" title="Redo (Ctrl+Y)" onMouseDown={(e) => { e.preventDefault(); execCmd("redo"); }}
          className="flex h-7 w-7 items-center justify-center rounded text-[#374151] hover:bg-[#e5e7eb]">
          <RedoIcon />
        </button>
      </div>

      {/* ── Editor Area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className={[
          "px-4 py-3 text-sm text-[#191c1d] outline-none",
          // Heading styles
          "[&_h1]:text-xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:my-2",
          "[&_h2]:text-lg [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:my-1.5",
          "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:my-1",
          // List styles
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5",
          "[&_li]:my-0.5",
          // Other styles
          "[&_a]:text-blue-600 [&_a]:underline",
          "[&_p]:my-1",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-[#bfc9c3] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[#707974]",
          // Placeholder
          "empty:before:content-[attr(data-placeholder)] empty:before:text-[#9ca3af] empty:before:pointer-events-none",
        ].join(" ")}
      />
    </div>
  );
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────
function BulletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <circle cx="4" cy="6" r="1.5" /><rect x="7" y="5" width="13" height="2" rx="1" />
      <circle cx="4" cy="12" r="1.5" /><rect x="7" y="11" width="13" height="2" rx="1" />
      <circle cx="4" cy="18" r="1.5" /><rect x="7" y="17" width="13" height="2" rx="1" />
    </svg>
  );
}

function NumberedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M3 4h1v3H3V4zm0 5h2v.5H4V10H3v-.5zm0 5h2v.5l-1 1H5V16H3v-.5l1-1H3zm4-10h11v2H7V4zm0 6h11v2H7v-2zm0 6h11v2H7v-2z"/>
    </svg>
  );
}

function AlignLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <rect x="3" y="5" width="18" height="2" rx="1" /><rect x="3" y="11" width="12" height="2" rx="1" /><rect x="3" y="17" width="15" height="2" rx="1" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <rect x="3" y="5" width="18" height="2" rx="1" /><rect x="6" y="11" width="12" height="2" rx="1" /><rect x="4.5" y="17" width="15" height="2" rx="1" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <rect x="3" y="5" width="18" height="2" rx="1" /><rect x="9" y="11" width="12" height="2" rx="1" /><rect x="6" y="17" width="15" height="2" rx="1" />
    </svg>
  );
}

function IndentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <rect x="3" y="5" width="18" height="2" rx="1" /><rect x="9" y="11" width="12" height="2" rx="1" /><rect x="9" y="17" width="12" height="2" rx="1" />
      <path d="M3 10l4 3-4 3V10z" />
    </svg>
  );
}

function OutdentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <rect x="3" y="5" width="18" height="2" rx="1" /><rect x="9" y="11" width="12" height="2" rx="1" /><rect x="9" y="17" width="12" height="2" rx="1" />
      <path d="M7 10l-4 3 4 3V10z" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M6 5L5 6l6 6-6 6 1 1 6-6 6 6 1-1-6-6 6-6-1-1-6 6z"/>
    </svg>
  );
}

function HighlightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M3 20h18v2H3zm5.75-5.96l3.54-3.54 4.24 4.24-3.53 3.53-4.25-4.23zM20.71 5.29l-2-2a1 1 0 0 0-1.41 0L9 11.59 13.41 16l8.3-8.3a1 1 0 0 0 0-1.41z"/>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
    </svg>
  );
}

function UnlinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M18.4 10.6C16.55 9 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
    </svg>
  );
}
