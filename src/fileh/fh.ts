import path from "path";
import fs from "node:fs/promises";
import {
    getFileExtension,
    isHardDetectBinFiles,
    projectRootDir,
    projectRootSrcDir,
} from "../utility";
import type { FileInfo } from "../types";
import { IGNOREDDIRS, IGNOREDFILEEXTS } from "../misc/constants";

export async function findAllFilesInProjectDir(
    projectdir: string = projectRootDir,
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
            if (IGNOREDDIRS.includes(name as any)) {
                continue;
            }
            files.push(
                ...(await findAllFilesInProjectDir(path.resolve(parentPath, name))),
            );
            continue;
        }

        if (content.isSymbolicLink()) continue;

        if (content.isFile()) {
            const extension = getFileExtension(name);
            if (
                IGNOREDFILEEXTS.includes(extension as any) ||
                IGNOREDFILEEXTS.includes(name as any)
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
                content: await fs.readFile(
                    path.resolve(content.parentPath, content.name),
                    "utf-8",
                ),
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
