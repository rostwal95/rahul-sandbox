declare module "lowlight/lib/core" {
  import type { Lowlight } from "lowlight";
  export const lowlight: Lowlight;
  export default lowlight;
}

declare module "highlight.js/lib/languages/javascript" {
  const lang: any;
  export default lang;
}
declare module "highlight.js/lib/languages/typescript" {
  const lang: any;
  export default lang;
}
declare module "highlight.js/lib/languages/json" {
  const lang: any;
  export default lang;
}
