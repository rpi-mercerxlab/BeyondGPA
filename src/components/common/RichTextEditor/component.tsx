"use client";

import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TabHandler from "./tabHandler";
import ToolbarButton from "./toolbarButton";
import {
  Bold,
  Code,
  FileCode,
  Italic,
  List,
  ListOrdered,
  Redo,
  SubscriptIcon,
  SuperscriptIcon,
  Underline,
  Undo,
} from "lucide-react";

interface RichTextEditorProps {
  content?: string;
  onChange: (html: string) => void;
  onBlur: () => void;
}

export default function RichTextEditor({
  content = "",
  onChange,
  onBlur,
}: RichTextEditorProps) {
  const [, forceUpdate] = useState({});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: "",
          },
        },
        bold: {
          HTMLAttributes: {
            class: "font-bold text-primary",
          },
        },
        italic: {
          HTMLAttributes: {
            class: "italic",
          },
        },
        underline: {
          HTMLAttributes: {
            class: "underline",
          },
        },
        code: {
          HTMLAttributes: {
            class: "font-mono bg-gray-100 p-1 rounded-md",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "font-mono bg-gray-100 p-2 my-4 rounded-md w-full",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc list-outside pl-5",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal list-outside pl-5",
          },
        },
      }),
      Superscript,
      Subscript,
      TabHandler,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-none px-2 w-full rounded-b-md min-h-[150px]",
      },
    },

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    onBlur() {
      onBlur();
    },
    immediatelyRender: false,
  });

  // Subscribe to state changes so buttons re-render instantly
  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => forceUpdate({});
    editor.on("selectionUpdate", updateHandler);
    editor.on("transaction", updateHandler);
    editor.on("transaction", ({ editor }) => {
      const { empty, $from } = editor.state.selection;
      if (empty && editor.isActive("link")) {
        // Optionally unset link if cursor is just after a link
        const marks = $from.marks();
        const linkMark = marks.find((m) => m.type.name === "link");
        if (!linkMark) return;
        editor.chain().focus().unsetLink().run();
      }
    });

    return () => {
      editor.off("selectionUpdate", updateHandler);
      editor.off("transaction", updateHandler);
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="border rounded-md p-4 text-gray-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="space-y-2 bg-bg-base-100 border border-gray-400 rounded-md w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap space-x-2 space-y-2 border-b border-gray-200 px-2 pt-2">
        <ToolbarButton
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          tooltip="Bold"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          tooltip="Italic"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          isActive={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          tooltip="Underline"
        >
          <Underline size={16} />
        </ToolbarButton>
        <ToolbarButton
          isActive={editor.isActive("superscript")}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          tooltip="Superscript"
        >
          <SuperscriptIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          isActive={editor.isActive("subscript")}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          tooltip="Subscript"
        >
          <SubscriptIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          isActive={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
          tooltip="Inline Code"
        >
          <Code size={16} />
        </ToolbarButton>
        <ToolbarButton
          isActive={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          tooltip="Code Block"
        >
          <FileCode size={16} />
        </ToolbarButton>
        <ToolbarButton
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          tooltip="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          tooltip="Ordered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        <button
          onClick={() => {
            editor.chain().focus().undo().run();
          }}
          className={`w-8 h-8 px-2 py-1 rounded ${
            editor.can().undo()
              ? "bg-bg-base-100 border border-gray-300 hover:bg-gray-200 active:bg-primary active:text-white"
              : "bg-gray-100"
          }`}
          title="Undo"
        >
          <Undo size={16} />
        </button>

        <button
          onClick={() => {
            editor.chain().focus().redo().run();
          }}
          className={` w-8 h-8  px-2 py-1 rounded ${
            editor.can().redo()
              ? "bg-bg-base-100 border border-gray-300 hover:bg-gray-200 active:bg-primary active:text-white"
              : "bg-gray-100"
          }`}
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
