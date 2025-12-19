import { detectProjectFramework } from "./fileh/fh";
import { } from "./misc/constants";
import { getGitRepoDetails, projectRootDir } from "./utility";

detectProjectFramework(projectRootDir);
console.log(await getGitRepoDetails());

// TODO:
