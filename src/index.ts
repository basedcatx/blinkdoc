import { detectProjectFramework } from "./fileh/fh";
import { } from "./misc/constants";
import { getGitUserDetails, projectRootDir } from "./utility";

detectProjectFramework(projectRootDir);
console.log(await getGitUserDetails());

// TODO:
