"use client";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
// (Optional future enhancement) For inline image resizing, we could add an extension
// like a custom DragHandle around images. Placeholder comment left intentionally.
import {
  Bold,
  Italic,
  List,
  Heading2,
  Undo,
  Redo,
  Link as LinkIcon,
} from "lucide-react";
import React, {
  useEffect,
  ReactElement,
  useState,
  useCallback,
  useMemo,
} from "react";

export function TiptapEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [slashQuery, setSlashQuery] = useState("");
  const [showSlash, setShowSlash] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({ openOnClick: false }) as any,
      Image.configure({ inline: true }) as any,
      Placeholder.configure({
        placeholder: placeholder || "Start writing…",
      }) as any,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      const text = editor.getText();
      setCharCount(text.length);
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
    editorProps: {
      handlePaste(view, event) {
        if (event.clipboardData) {
          const items = event.clipboardData.items;
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith("image")) {
              const file = item.getAsFile();
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(
                      (view.state.schema.nodes.image as any).create({
                        src: reader.result,
                      })
                    )
                  );
                };
                reader.readAsDataURL(file);
                return true;
              }
            }
          }
        }
        return false;
      },
      handleDrop(view, event, _slice, moved) {
        if (moved) return false;
        const dt = event.dataTransfer;
        if (dt && dt.files && dt.files.length) {
          const file = dt.files[0];
          if (file.type.startsWith("image")) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = () => {
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  (view.state.schema.nodes.image as any).create({
                    src: reader.result,
                  })
                )
              );
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      handleKeyDown(view, ev) {
        if (ev.key === "/") {
          setShowSlash(true);
          setSlashQuery("");
        } else if (showSlash) {
          if (ev.key === "Escape") {
            setShowSlash(false);
            return false;
          }
          if (ev.key === "Backspace" && slashQuery === "") {
            setShowSlash(false);
            return false;
          }
          if (/^[a-zA-Z]$/.test(ev.key)) {
            setSlashQuery((q) => (q + ev.key).slice(0, 32));
          } else if (ev.key === "Enter") {
            const first = filteredCommands[0];
            if (first) {
              first.action();
              setShowSlash(false);
              return true;
            }
          }
        }
        return false;
      },
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[260px]",
      },
    },
  });

  const commands = useMemo(
    () => [
      {
        key: "h2",
        label: "Heading 2",
        action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        key: "h3",
        label: "Heading 3",
        action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      },
      {
        key: "list",
        label: "Bullet List",
        action: () => editor?.chain().focus().toggleBulletList().run(),
      },
      {
        key: "quote",
        label: "Quote",
        action: () => editor?.chain().focus().toggleBlockquote().run(),
      },
      {
        key: "divider",
        label: "Divider",
        action: () => editor?.chain().focus().setHorizontalRule().run(),
      },
    ],
    [editor]
  );
  const filteredCommands = commands.filter(
    (c) =>
      c.key.includes(slashQuery.toLowerCase()) ||
      c.label.toLowerCase().includes(slashQuery.toLowerCase())
  );

  const applyCommand = useCallback(
    (cmdKey: string) => {
      const cmd = commands.find((c) => c.key === cmdKey);
      if (cmd) {
        cmd.action();
        setShowSlash(false);
      }
    },
    [commands]
  );

  // Keep external value in sync without re-instantiating the editor
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const mkBtn = (opts: {
    label: string;
    icon: ReactElement;
    isActive?: boolean;
    onClick: () => void;
    disabled?: boolean;
    aria?: string;
  }) => (
    <button
      type="button"
      onClick={opts.onClick}
      disabled={opts.disabled}
      aria-label={opts.aria || opts.label}
      aria-pressed={opts.isActive || false}
      className={`h-7 w-7 inline-flex items-center justify-center rounded-md border border-[rgba(var(--border),0.5)] text-[11px] hover:bg-[rgba(var(--fg),0.06)] active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed ${
        opts.isActive ? "bg-[rgba(var(--fg),0.1)]" : "bg-[rgb(var(--bg-1))]"
      }`}
    >
      {opts.icon}
    </button>
  );

  return (
    <div className="rounded-lg border border-[rgba(var(--border),0.5)] bg-[rgb(var(--bg-1))] overflow-hidden relative">
      {/* Primary toolbar */}
      <div className="flex flex-wrap gap-1 p-2 pr-3 border-b border-[rgba(var(--border),0.5)] bg-[rgb(var(--bg))]/60 backdrop-blur-sm text-[11px] items-center">
        {mkBtn({
          label: "Bold",
          icon: <Bold className="h-3.5 w-3.5" />,
          isActive: !!editor?.isActive("bold"),
          onClick: () => editor?.chain().focus().toggleBold().run(),
        })}
        {mkBtn({
          label: "Italic",
          icon: <Italic className="h-3.5 w-3.5" />,
          isActive: !!editor?.isActive("italic"),
          onClick: () => editor?.chain().focus().toggleItalic().run(),
        })}
        {mkBtn({
          label: "Bullet List",
          icon: <List className="h-3.5 w-3.5" />,
          isActive: !!editor?.isActive("bulletList"),
          onClick: () => editor?.chain().focus().toggleBulletList().run(),
        })}
        {mkBtn({
          label: "H2",
          icon: <Heading2 className="h-3.5 w-3.5" />,
          isActive: !!editor?.isActive("heading", { level: 2 }),
          onClick: () =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run(),
        })}
        {mkBtn({
          label: "Link",
          icon: <LinkIcon className="h-3.5 w-3.5" />,
          isActive: !!editor?.isActive("link"),
          onClick: () => {
            const prev = editor?.getAttributes("link").href;
            const url = window.prompt("Enter URL", prev || "https://");
            if (url === null) return;
            if (url === "") editor?.chain().focus().unsetLink().run();
            else
              editor
                ?.chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url })
                .run();
          },
        })}
        <span className="mx-1 w-px bg-[rgba(var(--border),0.5)]" />
        {mkBtn({
          label: "Undo",
          icon: <Undo className="h-3.5 w-3.5" />,
          disabled: !editor?.can().undo(),
          onClick: () => editor?.chain().focus().undo().run(),
        })}
        {mkBtn({
          label: "Redo",
          icon: <Redo className="h-3.5 w-3.5" />,
          disabled: !editor?.can().redo(),
          onClick: () => editor?.chain().focus().redo().run(),
        })}
        <div className="ml-auto flex items-center gap-2 text-[10px] text-muted-2">
          <span>{wordCount}w</span>
          <span>{charCount}ch</span>
        </div>
      </div>

      {/* Editing surface */}
      <div className="px-4 py-3 bg-[rgb(var(--bg))] min-h-[260px] relative">
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 120 }}
            className="flex gap-1 rounded-md border border-[rgba(var(--border),0.5)] bg-[rgb(var(--bg))] px-1 py-1 shadow-sm"
          >
            {mkBtn({
              label: "B",
              icon: <Bold className="h-3 w-3" />,
              isActive: !!editor.isActive("bold"),
              onClick: () => editor.chain().focus().toggleBold().run(),
            })}
            {mkBtn({
              label: "I",
              icon: <Italic className="h-3 w-3" />,
              isActive: !!editor.isActive("italic"),
              onClick: () => editor.chain().focus().toggleItalic().run(),
            })}
            {mkBtn({
              label: "H2",
              icon: <Heading2 className="h-3 w-3" />,
              isActive: !!editor.isActive("heading", { level: 2 }),
              onClick: () =>
                editor.chain().focus().toggleHeading({ level: 2 }).run(),
            })}
            {mkBtn({
              label: "Link",
              icon: <LinkIcon className="h-3 w-3" />,
              isActive: !!editor.isActive("link"),
              onClick: () => {
                const prev = editor.getAttributes("link").href;
                const url = window.prompt("Enter URL", prev || "https://");
                if (url === null) return;
                if (!url) editor.chain().focus().unsetLink().run();
                else
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .setLink({ href: url })
                    .run();
              },
            })}
          </BubbleMenu>
        )}
        <EditorContent editor={editor} />

        {/* Slash command menu */}
        {showSlash && filteredCommands.length > 0 && (
          <div className="absolute z-20 mt-2 w-48 rounded-md border border-[rgba(var(--border),0.5)] bg-[rgb(var(--bg))] shadow-md text-[12px] p-1 space-y-1">
            {filteredCommands.slice(0, 6).map((cmd) => (
              <button
                key={cmd.key}
                onClick={() => applyCommand(cmd.key)}
                className="w-full text-left px-2 py-1 rounded hover:bg-[rgba(var(--fg),0.06)]"
              >
                /{cmd.key} <span className="text-muted-2">{cmd.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="absolute right-2 bottom-2 pointer-events-none select-none text-[10px] text-muted-2">
          Paste or drop images
        </div>
      </div>
    </div>
  );
}
