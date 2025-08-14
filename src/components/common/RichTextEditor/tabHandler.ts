import { Extension } from "@tiptap/core";

const TabHandler = Extension.create({
  name: "tabHandler",

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        const { editor } = this;
        const { state, view } = editor;
        const { from, to } = state.selection;

        // Insert 2 spaces at cursor
        editor.chain().focus().insertContentAt({ from, to }, "\t").run();

        return true; // prevent default browser tab
      },
    };
  },
});

export default TabHandler;
