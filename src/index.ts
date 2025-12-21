import { detectProjectFramework, findAllFilesInProjectDir } from "./fileh/fh";
import { } from "./misc/constants";
import type { ConfigDB } from "./types";
import {
    DEFAULT_CONFIG_FILE,
    getFileFromGitRepo,
    projectRootDir,
    saveConfigDbFile,
} from "./utility";

async function init() {
    const unfilteredFilesAndDirs = await findAllFilesInProjectDir(
        projectRootDir,
        false,
    );

    const configDb = DEFAULT_CONFIG_FILE;

    for (const node of unfilteredFilesAndDirs) {
        if (node.type === "dir") {
            if (node.name === ".git") {
                configDb.isVCS = true;
                continue;
            }

            if (node.name === "LICENSE") {
                configDb.isVCS = true;
                continue;
            }
        }

        if (node.type === "file") {
            switch (node.name) {
                case "package.json":
                    configDb.build_scripts.node = { exists: true, path: node.path };
                    break;

                case "Cargo.toml":
                    configDb.build_scripts.rust = { exists: true, path: node.path };
                    break;

                case "build.zig.zon":
                    configDb.build_scripts.zig = { exists: true, path: node.path };
                    break;

                case ".gitignore":
                    configDb.filePaths.gitignore = node.path;
            }
        }
    }

    await saveConfigDbFile(configDb);
}

const license = await getFileFromGitRepo(
    "git@github.com:RocketChat/Rocket.Chat.git",
    "README.md",
);
console.log(license);

// init();
