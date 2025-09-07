"use client";
import * as React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
// Image extension temporarily removed due to v2/v3 type conflicts.
// NOTE: CodeBlockLowlight (v2) conflicts with core v3; using StarterKit's codeBlock for now.

export interface RichEmailEditorProps {
  value: string;
  onChange: (html: string, plain: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
  mode?: "rich" | "sms";
}

// Simple placeholder overlay logic (no plugin) to stay version agnostic
function PlaceholderOverlay({ editor, text }: { editor: any; text: string }) {
  if (!editor || editor.isFocused || editor.getText().length > 0) return null;
  return (
    <div className="pointer-events-none text-neutral-400 dark:text-neutral-500 absolute top-3 left-3 text-sm select-none">
      {text}
    </div>
  );
}

export function RichEmailEditor({
  value,
  onChange,
  placeholder = "Write your email...",
  minHeight = 180,
  disabled,
  mode = "rich",
}: RichEmailEditorProps) {
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Underline,
        Link.configure({ openOnClick: false }),
      ],
      content: value || "<p></p>",
      editable: !disabled,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        const plain = editor.getText();
        onChange(html, plain);
      },
    },
    [disabled],
  );

  // Toolbar actions
  const cmd = (f: () => void) => {
    f();
    editor?.chain().focus();
  };

  const plain = editor?.getText() || "";
  const words = plain.trim() ? plain.trim().split(/\s+/).length : 0;
  const chars = plain.length;
  const smsSegments = mode === "sms" ? Math.ceil(chars / 160) : null;
  const [showPlain, setShowPlain] = React.useState(false);
  const [slashOpen, setSlashOpen] = React.useState(false);
  const [slashQuery, setSlashQuery] = React.useState("");
  const [slashCoords, setSlashCoords] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const [slashIndex, setSlashIndex] = React.useState(0);

  // Slash command items
  const slashItems = React.useMemo(
    () =>
      [
        {
          key: "h1",
          label: "Heading 1",
          action: () =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          key: "h2",
          label: "Heading 2",
          action: () =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          key: "h3",
          label: "Heading 3",
          action: () =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        {
          key: "bulletList",
          label: "Bullet List",
          action: () => editor?.chain().focus().toggleBulletList().run(),
        },
        {
          key: "orderedList",
          label: "Ordered List",
          action: () => editor?.chain().focus().toggleOrderedList().run(),
        },
        {
          key: "codeBlock",
          label: "Code Block",
          action: () => editor?.chain().focus().toggleCodeBlock().run(),
        },
        {
          key: "hr",
          label: "Horizontal Rule",
          action: () => editor?.chain().focus().setHorizontalRule().run(),
        },
        {
          key: "image",
          label: "Image…",
          action: () => {
            const url = prompt("Image URL");
            if (url)
              editor
                ?.chain()
                .focus()
                .insertContent({ type: "image", attrs: { src: url } })
                .run();
          },
        },
      ].filter(
        (i) =>
          !slashQuery ||
          i.label.toLowerCase().includes(slashQuery.toLowerCase()),
      ),
    [slashQuery, editor],
  );

  // Detect "/" trigger pattern on each update
  React.useEffect(() => {
    if (!editor) return;
    const text = editor.state.doc.textBetween(
      0,
      editor.state.selection.from,
      "\n",
      "\n",
    );
    const match = /(?:^|\s)\/(\w*)$/.exec(text);
    if (match) {
      setSlashOpen(true);
      setSlashQuery(match[1]);
      const rect = editor.view.coordsAtPos(editor.state.selection.from);
      setSlashCoords({ x: rect.left, y: rect.bottom });
    } else {
      setSlashOpen(false);
      setSlashQuery("");
      setSlashIndex(0);
    }
  }, [plain, editor]);

  // Key handling for menu navigation
  React.useEffect(() => {
    if (!editor) return;
    const handler = (e: KeyboardEvent) => {
      if (!slashOpen) return;
      if (["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowDown")
        setSlashIndex((i) => (i + 1) % Math.max(slashItems.length, 1));
      if (e.key === "ArrowUp")
        setSlashIndex(
          (i) => (i - 1 + slashItems.length) % Math.max(slashItems.length, 1),
        );
      if (e.key === "Escape") {
        setSlashOpen(false);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        const item = slashItems[slashIndex];
        if (item) {
          // Remove the slash command text then run action
          editor
            .chain()
            .focus()
            .deleteRange({
              from: editor.state.selection.from - (slashQuery.length + 1),
              to: editor.state.selection.from,
            })
            .run();
          item.action();
          setSlashOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [slashOpen, slashItems, slashIndex, slashQuery, editor]);

  return (
    <div className="relative border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-[#121315] shadow-sm">
      <div className="flex flex-wrap gap-1 p-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-[#191b1f] rounded-t-lg">
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold")}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic")}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          active={editor?.isActive("underline")}
        >
          U
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          active={editor?.isActive("strike")}
        >
          S
        </ToolbarButton>
        <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700 mx-1" />
        <ToolbarButton
          onClick={() => editor?.chain().focus().setParagraph().run()}
          active={editor?.isActive("paragraph")}
        >
          P
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor?.isActive("heading", { level: 1 })}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor?.isActive("heading", { level: 2 })}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor?.isActive("heading", { level: 3 })}
        >
          H3
        </ToolbarButton>
        <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700 mx-1" />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive("bulletList")}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive("orderedList")}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive("blockquote")}
        >
          ❝
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        >
          —
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          active={editor?.isActive("codeBlock")}
        >
          {"{}"}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const prev = editor?.getAttributes("link").href || "";
            const url = prompt("Link URL", prev);
            if (url === null) return;
            if (url === "") editor?.chain().focus().unsetLink().run();
            else
              editor
                ?.chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url })
                .run();
          }}
          active={editor?.isActive("link")}
        >
          Link
        </ToolbarButton>
        <ToolbarButton onClick={() => setShowPlain((p) => !p)}>
          {showPlain ? "Rich" : "Plain"}
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().undo().run()}>
          ↺
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().redo().run()}>
          ↻
        </ToolbarButton>
      </div>
      <div className="relative">
        <PlaceholderOverlay editor={editor} text={placeholder} />
        {showPlain ? (
          <pre className="px-3 py-3 text-xs whitespace-pre-wrap font-mono min-h-[120px] text-neutral-600 dark:text-neutral-300">
            {plain || "(empty)"}
          </pre>
        ) : (
          <EditorContent
            editor={editor}
            className="prose prose-sm dark:prose-invert max-w-none px-3 py-3 focus:outline-none"
            style={{ minHeight }}
          />
        )}
        {slashOpen && slashCoords && slashItems.length > 0 && (
          <div
            style={{ top: slashCoords.y + 4, left: slashCoords.x }}
            className="absolute z-50 w-56 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#202327] shadow-lg p-1 text-sm"
          >
            {slashItems.map((item, i) => (
              <button
                key={item.key}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor
                    ?.chain()
                    .focus()
                    .deleteRange({
                      from:
                        editor.state.selection.from - (slashQuery.length + 1),
                      to: editor.state.selection.from,
                    })
                    .run();
                  item.action();
                  setSlashOpen(false);
                }}
                className={`w-full text-left px-2 py-1 rounded-md ${i === slashIndex ? "bg-emerald-600 text-white" : "hover:bg-neutral-100 dark:hover:bg-[#2a2d31] text-neutral-700 dark:text-neutral-200"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50/60 dark:bg-[#191b1f] text-[10px] tracking-wide uppercase text-neutral-500 dark:text-neutral-400 rounded-b-lg">
        <span>
          Words:{" "}
          <strong className="font-semibold text-neutral-700 dark:text-neutral-200">
            {words}
          </strong>{" "}
          · Chars:{" "}
          <strong className="font-semibold text-neutral-700 dark:text-neutral-200">
            {chars}
          </strong>
          {smsSegments !== null && (
            <span>
              {" "}
              · Segments: <strong>{smsSegments}</strong>
            </span>
          )}
        </span>
        <span className="text-[9px]">Cmd+Shift+C code · 160 char SMS seg</span>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-2 h-7 inline-flex items-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#202327] hover:bg-neutral-100 dark:hover:bg-[#2a2d31] transition-colors ${active ? "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300" : "text-neutral-600 dark:text-neutral-300"}`}
    >
      {children}
    </button>
  );
}

export default RichEmailEditor;
