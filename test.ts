import { globby as gb } from "globby";

import { projectRootDir } from "./src/utility";

console.log(
  await gb("**/*", {
    ignore: ["**/node_modules/**", "**/.git/**", "**/.blinkdoc"],
    dot: true,
    absolute: true,
  }),
);
