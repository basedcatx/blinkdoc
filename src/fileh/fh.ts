import path from "path";
import fs from "node:fs/promises";
import {
    filterFilesAndDir,
    findAndAddFws,
    getFileExtension,
    isHardDetectBinFiles,
    projectRootDir,
} from "../utility";
import type { FileInfo, ProjectProfile, UFileInfo } from "../types";
import { PROJECT_RUNTIMES, RUNTIMES } from "../misc/constants";

// We would have to separate filtering from enumeration.
export async function findAllFilesInProjectDir(
    projectdir: string = projectRootDir,
    withContent: boolean = true,
): Promise<UFileInfo[]> {
    const dirs = await fs.readdir(projectdir || projectRootDir, {
        withFileTypes: true,
    });
    const files: UFileInfo[] = [];

    for (const content of dirs) {
        const { parentPath, name } = content;

        if (content.isSymbolicLink()) continue;
        if (content.isDirectory()) {
            files.push({
                type: "dir",
                contents: await findAllFilesInProjectDir(
                    path.resolve(parentPath, name),
                    withContent,
                ),
                name: content.name,
                path: content.parentPath,
            });
            continue;
        }

        if (content.isFile()) {
            const extension = getFileExtension(name);

            if (
                await isHardDetectBinFiles(
                    path.resolve(content.parentPath, content.name),
                )
            ) {
                continue;
            }

            // For now we would leave out the opts field, would do some mapping later on and add more context. We need to also do framework detection.
            //
            files.push({
                type: "file",
                path: path.resolve(content.parentPath, content.name),
                relativePath: path.resolve(content.name),
                ext: extension,
                name: content.name,
                content: withContent
                    ? await fs.readFile(
                        path.resolve(content.parentPath, content.name),
                        "utf-8",
                    )
                    : "",
                size: Number(
                    (
                        (await fs.stat(path.resolve(content.parentPath, content.name)))
                            .size / 1024.0
                    ).toPrecision(2),
                ),
            });
        }
    }

    return files;
}

export async function detectProjectFramework(
    projectdir: string = projectRootDir,
) {
    //REQUIRES: filtering
    const files: FileInfo[] = await filterFilesAndDir(
        await findAllFilesInProjectDir(projectdir, false),
    );

    const profiles: ProjectProfile[] = [];
    const runtimes = PROJECT_RUNTIMES.map((rt) => {
        return {
            runtime:
                rt.files.some((fname) => {
                    return files.some((file) => fname === file.name);
                }) && rt.name,
            files: rt.files.filter((fname) =>
                files.some((file) => file.name === fname),
            ),
            frameworks: rt.frameworks
                .map((fw) => {
                    switch (rt.name) {
                        case RUNTIMES.Javascript: {
                            //TODO: We try to locate some package managers here. In future, we would save all these locations to a config file and just read from while scanning through the files on first pass.
                            // With time we would do a massive performance improvement with the file searching. We would automatically index most of these files on the very first recursive search, to avoid a lot of loops.

                            const pkgjson = files.find(
                                (f) => f.name.toLowerCase() === "package.json",
                            );

                            const cargotoml = files.find((f) => f.name === "Cargo.toml");

                            let res: string[] = [];
                            if (pkgjson) {
                                res = [...res, ...findAndAddFws(fw, files, pkgjson)];
                            }

                            if (cargotoml) {
                                res = [...res, ...findAndAddFws(fw, files, cargotoml)];
                            }

                            res = [...res, ...findAndAddFws(fw, files)];

                            return res;
                        }

                        //TODO: Add other language detection;
                        // Maybe there would be no specific need for this soon, as the whole structure should easily add a new language automatically
                    }
                })
                .reduce<string[]>((acc, curr) => {
                    if (acc instanceof Array && curr instanceof Array) {
                        return acc.concat(curr);
                    } else return [];
                }, []),
        };
    }).filter((rt) => {
        return rt.runtime && rt.files;
    });

    runtimes.forEach(function(r) {
        profiles.push({
            ctx: {
                name: r.runtime,
                files: r.files,
                frameworks: r.frameworks,
            },
            hasFrontend: false,
        });
    });

    console.log(files)
    console.log(files.find((f) => f.name === ".env"));
}
