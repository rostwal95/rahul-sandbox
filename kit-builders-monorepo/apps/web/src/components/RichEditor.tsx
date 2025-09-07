"use client";
import { useFlag } from "@/hooks/useFlag";
import React, { useEffect, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import ImageUploadButton from "./ImageUploadButton";
import MultiUploader from "./MultiUploader";

export default function RichEditor({
  content,
  onChange,
}: {
  content?: string;
  onChange?: (html: string) => void;
}) {
  // Avoid initializing editor during SSR to prevent hydration mismatch warning.
  const isClient = typeof window !== "undefined";
  const editorOptions = isClient
    ? {
        extensions: [
          StarterKit.configure({}),
          Underline,
          Link.configure({ openOnClick: false }),
          Image as any,
        ] as any,
        editorProps: { attributes: { "data-imm-render": "false" } },
        immediatelyRender: false,
        onUpdate({ editor }: { editor: Editor }) {
          onChange?.(editor.getHTML());
        },
        content: "",
      }
    : { extensions: [], content: "", immediatelyRender: false };
  const editor = useEditor(editorOptions as any);

  useEffect(() => {
    if (editor && isClient) {
      // Only set content after mount to avoid SSR mismatch
      if (editor.isEmpty) {
        editor.commands.setContent(content || "<p>Write here…</p>");
      }
    }
  }, [editor, isClient, content]);

  // Don't render editor shell until client to keep markup consistent
  if (!isClient) return null;

  const validImage = (url: string) =>
    /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(url);
  const insertImage = () => {
    const url = prompt("Image URL (png,jpg,gif,webp,avif,svg)");
    if (!url) return;
    if (!validImage(url)) {
      alert("Unsupported image extension");
      return;
    }
    editor
      ?.chain()
      .focus()
      .insertContent({ type: "image", attrs: { src: url, alt: "" } })
      .run();
  };
  const insertCode = () => editor?.chain().focus().toggleCodeBlock().run();
  const insertHeading = () =>
    editor?.chain().focus().toggleHeading({ level: 2 }).run();
  const insertBullet = () => editor?.chain().focus().toggleBulletList().run();
  const insertOrdered = () => editor?.chain().focus().toggleOrderedList().run();

  return (
    <div className="card p-3">
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          className="btn btn-outline"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          className="btn btn-outline"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          className="btn btn-outline"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          Underline
        </button>
        <button className="btn btn-outline" onClick={insertHeading}>
          H2
        </button>
        <button className="btn btn-outline" onClick={insertBullet}>
          • List
        </button>
        <button className="btn btn-outline" onClick={insertOrdered}>
          1. List
        </button>
        <button className="btn btn-outline" onClick={insertCode}>
          Code
        </button>
        <button className="btn btn-outline" onClick={insertImage}>
          Image (URL)
        </button>
      </div>
      <div className="flex gap-2 items-center">
        <button
          className="btn btn-outline"
          onClick={async () => {
            const sel = editor?.getHTML() || "";
            const p = prompt(
              'Rewrite prompt (e.g., "make it more concise")',
              "make it more concise",
            );
            if (!p) return;
            const r = await fetch("/api/ai/write", {
              method: "POST",
              body: JSON.stringify({ prompt: p, html: sel }),
            });
            const j = await r.json();
            if (j.ok) {
              editor?.commands.setContent(j.html);
            }
          }}
        >
          AI: Rewrite
        </button>
        <button
          className="btn btn-outline"
          onClick={async () => {
            const sel = editor?.getHTML() || "";
            const r = await fetch("/api/ai/summarize", {
              method: "POST",
              body: JSON.stringify({ html: sel }),
            });
            const j = await r.json();
            if (j.ok) {
              editor?.commands.insertContent(
                `<p><strong>${j.text}</strong></p>`,
              );
            }
          }}
        >
          AI: Summarize
        </button>
        {useFlag("ai_tools") && (
          <button
            className="btn btn-outline"
            onClick={async () => {
              const product = prompt("Product?", "Newsletter");
              const audience = prompt("Audience?", "Creators");
              const r = await fetch("/api/ai/cta", {
                method: "POST",
                body: JSON.stringify({ product, audience }),
              });
              const j = await r.json();
              if (j.ok) {
                editor?.commands.insertContent(
                  `<p><a href='#' class='btn'>${j.text}</a></p>`,
                );
              }
            }}
          >
            AI: CTA
          </button>
        )}
        <button
          className="btn btn-outline"
          onClick={async () => {
            const sel = editor?.state?.selection;
            if (!sel || sel.empty) {
              alert("Select some text first");
              return;
            }
            const { from, to } = sel;
            const text = editor?.state.doc.textBetween(from, to, "\n");
            const r = await fetch("/api/ai/write", {
              method: "POST",
              body: JSON.stringify({
                prompt: "rewrite the selection clearly and concisely",
                html: text,
              }),
            });
            const j = await r.json();
            if (j.ok) {
              editor?.commands.insertContentAt({ from, to }, j.html);
            }
          }}
        >
          AI: Rewrite Selection
        </button>
      </div>
      <ImageUploadButton
        onUploaded={(url) => {
          if (!validImage(url)) return;
          editor
            ?.chain()
            .focus()
            .insertContent({ type: "image", attrs: { src: url, alt: "" } })
            .run();
        }}
      />
      <MultiUploader
        onUploaded={(url) => {
          if (!validImage(url)) return;
          editor
            ?.chain()
            .focus()
            .insertContent({ type: "image", attrs: { src: url, alt: "" } })
            .run();
        }}
      />
      <div className="text-xs text-zinc-500 mb-1">
        Tip: type “/” to open quick insert.
      </div>
      <SlashMenu editor={editor!} validImage={validImage} />
      {editor && (
        <EditorContent
          editor={editor}
          className="rounded-xl border border-[var(--border)] px-3 py-2 min-h-[160px]"
        />
      )}
    </div>
  );
}

function SlashMenu({
  editor,
  validImage,
}: {
  editor: Editor;
  validImage: (u: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <input
        className="input mb-2"
        placeholder="Slash menu: /h2, /ul, /ol, /img"
        onChange={(e) => {
          const v = e.target.value;
          if (v.startsWith("/")) setOpen(true);
          else setOpen(false);
          if (v === "/h2") {
            editor.chain().focus().toggleHeading({ level: 2 }).run();
            e.target.value = "";
            setOpen(false);
          }
          if (v === "/ul") {
            editor.chain().focus().toggleBulletList().run();
            e.target.value = "";
            setOpen(false);
          }
          if (v === "/ol") {
            editor.chain().focus().toggleOrderedList().run();
            e.target.value = "";
            setOpen(false);
          }
          if (v === "/img") {
            const url = prompt("Image URL (png,jpg,gif,webp,avif,svg)");
            if (url && validImage(url))
              editor
                .chain()
                .focus()
                .insertContent({ type: "image", attrs: { src: url, alt: "" } })
                .run();
            e.target.value = "";
            setOpen(false);
          }
        }}
      />
      {open && (
        <div className="absolute left-0 top-10 z-10 card p-2 text-sm">
          Type a command and press enter.
        </div>
      )}
    </div>
  );
}
