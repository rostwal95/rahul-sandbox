"use client";

import { useEffect, useRef } from "react";

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const exec = (cmd: string, arg?: string) =>
    document.execCommand(cmd, false, arg);
  useEffect(() => {
    if (ref.current && value !== ref.current.innerHTML) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);
  const handleInput = () => onChange(ref.current?.innerHTML || "");

  const link = () => {
    const url = window.prompt("Enter URL");
    if (url) exec("createLink", url);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2 items-center">
        <div className="flex gap-1">
          <button
            className="toolbar-btn"
            type="button"
            onClick={() => exec("formatBlock", "H1")}
          >
            H1
          </button>
          <button
            className="toolbar-btn"
            type="button"
            onClick={() => exec("formatBlock", "H2")}
          >
            H2
          </button>
          <button
            className="toolbar-btn"
            type="button"
            onClick={() => exec("formatBlock", "P")}
          >
            P
          </button>
        </div>
        <div className="flex gap-1">
          <button
            className="toolbar-btn"
            type="button"
            onClick={() => exec("bold")}
          >
            B
          </button>
          <button
            className="toolbar-btn"
            type="button"
            onClick={() => exec("italic")}
          >
            I
          </button>
          <button
            className="toolbar-btn"
            type="button"
            onClick={() => exec("underline")}
          >
            U
          </button>
          <button
            className="toolbar-btn"
            type="button"
            onClick={() => exec("insertUnorderedList")}
          >
            • List
          </button>
          <button
            className="toolbar-btn"
            type="button"
            onClick={() => exec("insertOrderedList")}
          >
            1. List
          </button>
          <button
            className="toolbar-btn"
            type="button"
            onClick={() => exec("formatBlock", "BLOCKQUOTE")}
          >
            ❝
          </button>
          <button className="toolbar-btn" type="button" onClick={link}>
            🔗
          </button>
        </div>
        <span className="tag ml-auto">Rich text</span>
      </div>
      <div
        ref={ref}
        className="rte min-h-[220px] rounded-xl border border-[var(--border)] p-3 text-sm bg-white"
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        style={{ outline: "none" }}
      />
    </div>
  );
}
