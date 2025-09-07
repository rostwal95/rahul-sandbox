declare module "@tiptap/extension-code-block-lowlight" {
  import { Extension } from "@tiptap/core";
  const CodeBlockLowlight: Extension & { configure: (options: any) => any };
  export default CodeBlockLowlight;
}
