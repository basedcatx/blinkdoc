import path from "path";
import fs from "node:fs/promises";
import {
    getFileExtension,
    isFoundInDeps,
    isHardDetectBinFiles,
    projectRootDir,
    projectRootSrcDir,
} from "../utility";
import type { FileInfo, ProjectProfile } from "../types";
import {
    IGNORED_DIRS,
    IGNORED_FILE_EXTS,
    PROJECT_RUNTIMES,
    RUNTIMES,
} from "../misc/constants";

export async function findAllFilesInProjectDir(
    projectdir: string = projectRootDir,
    { withContent = true }: { withContent: boolean },
): Promise<FileInfo[]> {
    const dirs = await fs.readdir(
        projectdir || projectRootSrcDir || projectRootDir,
        {
            withFileTypes: true,
        },
    );
    const files: FileInfo[] = [];

    for (const content of dirs) {
        const { parentPath, name } = content;
        if (content.isDirectory()) {
            if (IGNORED_DIRS.includes(name as any)) {
                continue;
            }
            files.push(
                ...(await findAllFilesInProjectDir(path.resolve(parentPath, name), {
                    withContent: true,
                })),
            );
            continue;
        }

        if (content.isSymbolicLink()) continue;

        if (content.isFile()) {
            const extension = getFileExtension(name);
            if (
                IGNORED_FILE_EXTS.includes(extension as any) ||
                IGNORED_FILE_EXTS.includes(name as any)
            ) {
                continue;
            }
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
    projectdir: string = projectRootSrcDir,
) {
    const files: FileInfo[] = await findAllFilesInProjectDir(projectdir, {
        withContent: false,
    });

    // Project runtime detection.
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
            frameworks: Promise.all(
                rt.frameworks.map(async (fw) => {
                    switch (rt.name) {
                        case RUNTIMES.Javascript: {
                            const pkgjson = files.find(
                                (f) => f.name.toLowerCase() === "package.json",
                            );
                            // First we check if we can find any dependency specific file, if package.json was not found
                            if (!pkgjson) {
                                return fw.files.some((fname) =>
                                    files.some((file) => fname === file.name),
                                );
                            }

                            return await isFoundInDeps(pkgjson, fw.dependencies);
                        }

                        //TODO: Add other language detection;
                    }
                }),
            ),
        };
    }).filter((rt) => rt.runtime && rt.files);
    console.log(runtimes);
}
