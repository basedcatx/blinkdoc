import { findAllFilesInProjectDir } from "./fileh/fh";
import { generateFlattenedFileText, projectRootDir } from "./utility";

await generateFlattenedFileText(await findAllFilesInProjectDir());
