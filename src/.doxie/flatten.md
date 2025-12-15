### File /home/basedcatx/stuff/js/doxie/src/fileh/fh.ts

Language: TS

<content>
import path from "path";
import fs from "node:fs/promises";
import {
    getFileExtension,
    isHardDetectBinFiles,
    projectRootDir,
    projectRootSrcDir,
} from "../utility";
import { ignoredDirs, IgnoredFileExtensions } from "../misc/constants";

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
            if (ignoredDirs.includes(name as any)) {
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
                IgnoredFileExtensions.includes(extension as any) ||
                IgnoredFileExtensions.includes(name as any)
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

</content>

---

### File /home/basedcatx/stuff/js/doxie/src/misc/constants.ts

Language: TS

<content>
export const IgnoredFileExtensions = [
    "exe",
    "mp4",
    "iso",
    "mp3",
    "bin",
    "so",
    "a",
    "dll",
    "pyc",
    "class",
    "o",
    "jar",
    "war",
    "ear",
    "apk",
    "ipa",
    "dylib",
    "lock",
    "pnpm-lock.yaml",
    "Gemfile.lock",
    "CHANGELOG.md",
    "style.css",
    "main.css",
    "output.css",
    "gitignore",
    "npmignore",
    "tsconfig.json",
    "jest.config.js",
    "README.md",
    "DS_Store",
    "env",
    "Thumbs.db",
    "tsconfig.*",
    "iml",
    "editorconfig",
    "prettierrc*",
    "eslintrc*",
    "log",
    "min.js",
    "min.css",
    "pdf",
    "jpg",
    "png",
    "gif",
    "svg",
    "ico",
    "woff",
    "woff2",
    "ttf",
    "eot",
    "mp3",
    "mp4",
    "zip",
    "tar",
    "gz",
    "rar",
    "7z",
    "sqlite",
    "db",
    "sublime-workspace",
    "sublime-project",
    "bak",
    "swp",
    "swo",
    "pid",
    "seed",
    "pid.lock",
] as const;

export const ignoredDirs = [
    "node_modules",
    "dependencies",
    "ajax",
    "public",
    "android",
    "ios",
    ".expo",
    ".next",
    ".nuxt",
    ".svelte-kit",
    ".vercel",
    ".serverless",
    ".cache",
    "tests",
    "_tests_",
    "_test_",
    "__tests__",
    "coverage",
    "test",
    "spec",
    "cypress",
    "e2e",
    "dist",
    "build",
    "out",
    "bin",
    "obj",
    "lib",
    "target",
    "release",
    "debug",
    "artifacts",
    "generated",
    ".git",
    ".svn",
    ".hg",
    ".vscode",
    ".idea",
    ".vs",
    "venv",
    ".venv",
    "env",
    ".env",
    "virtualenv",
    "envs",
    "docs",
    "javadoc",
    "logs",
    "android",
    "ios",
    "windows",
    "linux",
    "macos",
    "web",
    ".dart_tool",
    ".gradle",
    ".mvn",
    ".npm",
    ".yarn",
    "tmp",
    "temp",
    "uploads",
    "public",
    "static",
    "assets",
    "images",
    "media",
    "migrations",
    "data",
    "db",
    "database",
    ".github",
    ".circleci",
    ".husky",
    "storage",
    "vendor",
    "cmake-build-debug",
    "packages",
    "plugins",
    "bun.lock",
] as const;

</content>

---

### File /home/basedcatx/stuff/js/doxie/src/types.d.ts

Language: TS

<content>
interface FileInfo {
    readonly path: string;
    readonly relativePath: string;
    readonly size: number; // in KiB
    readonly ext: string;
    readonly opt?: string;
    readonly content: string;
}

</content>

---

### File /home/basedcatx/stuff/js/doxie/src/index.ts

Language: TS

<content>
import { findAllFilesInProjectDir } from "./fileh/fh";
import { generateFlattenedFileText, projectRootDir } from "./utility";

await generateFlattenedFileText(await findAllFilesInProjectDir());

</content>

---

### File /home/basedcatx/stuff/js/doxie/src/utility.ts

Language: TS

<content>
import path from "path";
import fs from "fs/promises";

export const isBun = typeof Bun != undefined;
export const projectRootDir = path.resolve(import.meta.dir || __dirname, "..");
export const projectRootSrcDir = path.resolve(import.meta.dir || __dirname);
export const doxieOutputDir = path.join(projectRootSrcDir, ".doxie/");

export async function isHardDetectBinFiles(filePath: string): Promise<boolean> {
    try {
        const buffer = await fs.readFile(filePath);
        if ("\x00" in buffer) return true;
        const decoder = new TextDecoder("utf-8", { fatal: true });
        decoder.decode(buffer);
        return false;
    } catch (_) {
        return true;
    }
}

export function getFileExtension(fileName: string): string {
    return fileName.split(".").at(-1) || "unknown";
}

export async function generateFlattenedFileText(files: FileInfo[]) {
    const outdir = path.resolve(doxieOutputDir, "flatten.md");
    const res = [];
    for (const file of files) {
        res.push(
            `### File ${file.path}\n${file.opt ?? ""}\nLanguage: ${file.ext.toUpperCase()}\n\n<content>\n${file.content}\n</content>`,
        );
    }
    const generate_content = res.join("\n\n---\n\n");
    isBun
        ? await Bun.write(outdir, generate_content)
        : await fs.writeFile(outdir, generate_content);
}

</content>

---

### File /home/basedcatx/stuff/js/doxie/files.flatten.txt

Language: TXT

<content>
### File /home/basedcatx/stuff/js/doxie/src/fileh/fh.ts

Language: TS

<content>
import path from "path";
import fs from "node:fs/promises";
import {
    getFileExtension,
    isHardDetectBinFiles,
    projectRootDir,
    projectRootSrcDir,
} from "../utility";
import { ignoredDirs, IgnoredFileExtensions } from "../misc/constants";

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
            if (ignoredDirs.includes(name as any)) {
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
                IgnoredFileExtensions.includes(extension as any) ||
                IgnoredFileExtensions.includes(name as any)
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

</content>

---

### File /home/basedcatx/stuff/js/doxie/src/misc/constants.ts

Language: TS

<content>
export const IgnoredFileExtensions = [
    "exe",
    "mp4",
    "iso",
    "mp3",
    "bin",
    "so",
    "a",
    "dll",
    "pyc",
    "class",
    "o",
    "jar",
    "war",
    "ear",
    "apk",
    "ipa",
    "dylib",
    "lock",
    "pnpm-lock.yaml",
    "Gemfile.lock",
    "CHANGELOG.md",
    "style.css",
    "main.css",
    "output.css",
    "gitignore",
    "npmignore",
    "tsconfig.json",
    "jest.config.js",
    "README.md",
    "DS_Store",
    "env",
    "Thumbs.db",
    "tsconfig.*",
    "iml",
    "editorconfig",
    "prettierrc*",
    "eslintrc*",
    "log",
    "min.js",
    "min.css",
    "pdf",
    "jpg",
    "png",
    "gif",
    "svg",
    "ico",
    "woff",
    "woff2",
    "ttf",
    "eot",
    "mp3",
    "mp4",
    "zip",
    "tar",
    "gz",
    "rar",
    "7z",
    "sqlite",
    "db",
    "sublime-workspace",
    "sublime-project",
    "bak",
    "swp",
    "swo",
    "pid",
    "seed",
    "pid.lock",
] as const;

export const ignoredDirs = [
    "node_modules",
    "dependencies",
    "ajax",
    "public",
    "android",
    "ios",
    ".expo",
    ".next",
    ".nuxt",
    ".svelte-kit",
    ".vercel",
    ".serverless",
    ".cache",
    "tests",
    "_tests_",
    "_test_",
    "__tests__",
    "coverage",
    "test",
    "spec",
    "cypress",
    "e2e",
    "dist",
    "build",
    "out",
    "bin",
    "obj",
    "lib",
    "target",
    "release",
    "debug",
    "artifacts",
    "generated",
    ".git",
    ".svn",
    ".hg",
    ".vscode",
    ".idea",
    ".vs",
    "venv",
    ".venv",
    "env",
    ".env",
    "virtualenv",
    "envs",
    "docs",
    "javadoc",
    "logs",
    "android",
    "ios",
    "windows",
    "linux",
    "macos",
    "web",
    ".dart_tool",
    ".gradle",
    ".mvn",
    ".npm",
    ".yarn",
    "tmp",
    "temp",
    "uploads",
    "public",
    "static",
    "assets",
    "images",
    "media",
    "migrations",
    "data",
    "db",
    "database",
    ".github",
    ".circleci",
    ".husky",
    "storage",
    "vendor",
    "cmake-build-debug",
    "packages",
    "plugins",
    "bun.lock",
] as const;

</content>

---

### File /home/basedcatx/stuff/js/doxie/src/types.d.ts

Language: TS

<content>
interface FileInfo {
    readonly path: string;
    readonly relativePath: string;
    readonly size: number; // in KiB
    readonly ext: string;
    readonly opt?: string;
    readonly content: string;
}

</content>

---

### File /home/basedcatx/stuff/js/doxie/src/index.ts

Language: TS

<content>
import { findAllFilesInProjectDir } from "./fileh/fh";
import { generateFlattenedFileText, projectRootDir } from "./utility";

await generateFlattenedFileText(await findAllFilesInProjectDir());

</content>

---

### File /home/basedcatx/stuff/js/doxie/src/utility.ts

Language: TS

<content>
import path from "path";
import fs from "fs/promises";

export const isBun = typeof Bun != undefined;
export const projectRootDir = path.resolve(import.meta.dir || __dirname, "..");
export const projectRootSrcDir = path.resolve(import.meta.dir || __dirname);

export async function isHardDetectBinFiles(filePath: string): Promise<boolean> {
    try {
        const buffer = await fs.readFile(filePath);
        if ("\x00" in buffer) return true;
        const decoder = new TextDecoder("utf-8", { fatal: true });
        decoder.decode(buffer);
        return false;
    } catch (_) {
        return true;
    }
}

export function getFileExtension(fileName: string): string {
    return fileName.split(".").at(-1) || "unknown";
}

export async function generateFlattenedFileText(files: FileInfo[]) {
    const outdir = path.resolve(projectRootDir, "files.flatten.txt");
    const res = [];
    for (const file of files) {
        res.push(
            `### File ${file.path}\n${file.opt ?? ""}\nLanguage: ${file.ext.toUpperCase()}\n\n<content>\n${file.content}\n</content>`,
        );
    }
    const generate_content = res.join("\n\n---\n\n");
    isBun
        ? await Bun.write(outdir, generate_content)
        : await fs.writeFile(outdir, generate_content);
}

</content>

---

### File /home/basedcatx/stuff/js/doxie/files.flatten.txt

Language: TXT

<content>
### File /home/basedcatx/stuff/js/doxie/src/fileh/fh.ts

Language: TS

<content>
import path from "path";
import fs from "node:fs/promises";
import {
    getFileExtension,
    isHardDetectBinFiles,
    projectRootDir,
    projectRootSrcDir,
} from "../utility";
import { ignoredDirs, IgnoredFileExtensions } from "../misc/constants";

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
            if (ignoredDirs.includes(name as any)) {
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
                IgnoredFileExtensions.includes(extension as any) ||
                IgnoredFileExtensions.includes(name as any)
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


</content>
---
### File /home/basedcatx/stuff/js/doxie/src/misc/constants.ts

Language: TS

<content>
export const IgnoredFileExtensions = [
    "exe",
    "mp4",
    "iso",
    "mp3",
    "bin",
    "so",
    "a",
    "dll",
    "pyc",
    "class",
    "o",
    "jar",
    "war",
    "ear",
    "apk",
    "ipa",
    "dylib",
    "lock",
    "pnpm-lock.yaml",
    "Gemfile.lock",
    "CHANGELOG.md",
    "style.css",
    "main.css",
    "output.css",
    "gitignore",
    "npmignore",
    "tsconfig.json",
    "jest.config.js",
    "README.md",
    "DS_Store",
    "env",
    "Thumbs.db",
    "tsconfig.*",
    "iml",
    "editorconfig",
    "prettierrc*",
    "eslintrc*",
    "log",
    "min.js",
    "min.css",
    "pdf",
    "jpg",
    "png",
    "gif",
    "svg",
    "ico",
    "woff",
    "woff2",
    "ttf",
    "eot",
    "mp3",
    "mp4",
    "zip",
    "tar",
    "gz",
    "rar",
    "7z",
    "sqlite",
    "db",
    "sublime-workspace",
    "sublime-project",
    "bak",
    "swp",
    "swo",
    "pid",
    "seed",
    "pid.lock",
] as const;

export const ignoredDirs = [
    "node_modules",
    "dependencies",
    "ajax",
    "public",
    "android",
    "ios",
    ".expo",
    ".next",
    ".nuxt",
    ".svelte-kit",
    ".vercel",
    ".serverless",
    ".cache",
    "tests",
    "_tests_",
    "_test_",
    "__tests__",
    "coverage",
    "test",
    "spec",
    "cypress",
    "e2e",
    "dist",
    "build",
    "out",
    "bin",
    "obj",
    "lib",
    "target",
    "release",
    "debug",
    "artifacts",
    "generated",
    ".git",
    ".svn",
    ".hg",
    ".vscode",
    ".idea",
    ".vs",
    "venv",
    ".venv",
    "env",
    ".env",
    "virtualenv",
    "envs",
    "docs",
    "javadoc",
    "logs",
    "android",
    "ios",
    "windows",
    "linux",
    "macos",
    "web",
    ".dart_tool",
    ".gradle",
    ".mvn",
    ".npm",
    ".yarn",
    "tmp",
    "temp",
    "uploads",
    "public",
    "static",
    "assets",
    "images",
    "media",
    "migrations",
    "data",
    "db",
    "database",
    ".github",
    ".circleci",
    ".husky",
    "storage",
    "vendor",
    "cmake-build-debug",
    "packages",
    "plugins",
    "bun.lock",
] as const;


</content>
---
### File /home/basedcatx/stuff/js/doxie/src/types.d.ts

Language: TS

<content>
interface FileInfo {
    readonly path: string;
    readonly relativePath: string;
    readonly size: number; // in KiB
    readonly ext: string;
    readonly opt?: string;
    readonly content: string;
}


</content>
---
### File /home/basedcatx/stuff/js/doxie/src/index.ts

Language: TS

<content>
import { findAllFilesInProjectDir } from "./fileh/fh";
import { generateFlattenedFileText, projectRootDir } from "./utility";

await generateFlattenedFileText(await findAllFilesInProjectDir());


</content>
---
### File /home/basedcatx/stuff/js/doxie/src/utility.ts

Language: TS

<content>
import path from "path";
import fs from "fs/promises";

export const isBun = typeof Bun != undefined;
export const projectRootDir = path.resolve(import.meta.dir || __dirname, "..");
export const projectRootSrcDir = path.resolve(import.meta.dir || __dirname);

export async function isHardDetectBinFiles(filePath: string): Promise<boolean> {
    try {
        const buffer = await fs.readFile(filePath);
        if ("\x00" in buffer) return true;
        const decoder = new TextDecoder("utf-8", { fatal: true });
        decoder.decode(buffer);
        return false;
    } catch (_) {
        return true;
    }
}

export function getFileExtension(fileName: string): string {
    return fileName.split(".").at(-1) || "unknown";
}

export async function generateFlattenedFileText(files: FileInfo[]) {
    const outdir = path.resolve(projectRootDir, "files.flatten.txt");
    const res = [];
    for (const file of files) {
        res.push(
            `### File ${file.path}\n${file.opt ?? ""}\nLanguage: ${file.ext.toUpperCase()}\n\n<content>\n${file.content}\n\n</content>`,
        );
    }
    const generate_content = res.join("\n---\n");
    isBun
        ? await Bun.write(outdir, generate_content)
        : await fs.writeFile(outdir, generate_content);
}


</content>
---
### File /home/basedcatx/stuff/js/doxie/files.flatten.txt

Language: TXT

<content>
### File /home/basedcatx/stuff/js/doxie/src/fileh/fh.ts

Language: ts
<content>
import path from "path";
import fs from "node:fs/promises";
import {
    getFileExtension,
    isHardDetectBinFiles,
    projectRootDir,
    projectRootSrcDir,
} from "../utility";
import { ignoredDirs, IgnoredFileExtensions } from "../misc/constants";

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
            if (ignoredDirs.includes(name as any)) {
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
                IgnoredFileExtensions.includes(extension as any) ||
                IgnoredFileExtensions.includes(name as any)
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

</content>---### File /home/basedcatx/stuff/js/doxie/src/misc/constants.ts

Language: ts
<content>
export const IgnoredFileExtensions = [
    "exe",
    "mp4",
    "iso",
    "mp3",
    "bin",
    "so",
    "a",
    "dll",
    "pyc",
    "class",
    "o",
    "jar",
    "war",
    "ear",
    "apk",
    "ipa",
    "dylib",
    "lock",
    "pnpm-lock.yaml",
    "Gemfile.lock",
    "CHANGELOG.md",
    "style.css",
    "main.css",
    "output.css",
    "gitignore",
    "npmignore",
    "tsconfig.json",
    "jest.config.js",
    "README.md",
    "DS_Store",
    "env",
    "Thumbs.db",
    "tsconfig.*",
    "iml",
    "editorconfig",
    "prettierrc*",
    "eslintrc*",
    "log",
    "min.js",
    "min.css",
    "pdf",
    "jpg",
    "png",
    "gif",
    "svg",
    "ico",
    "woff",
    "woff2",
    "ttf",
    "eot",
    "mp3",
    "mp4",
    "zip",
    "tar",
    "gz",
    "rar",
    "7z",
    "sqlite",
    "db",
    "sublime-workspace",
    "sublime-project",
    "bak",
    "swp",
    "swo",
    "pid",
    "seed",
    "pid.lock",
] as const;

export const ignoredDirs = [
    "node_modules",
    "dependencies",
    "ajax",
    "public",
    "android",
    "ios",
    ".expo",
    ".next",
    ".nuxt",
    ".svelte-kit",
    ".vercel",
    ".serverless",
    ".cache",
    "tests",
    "_tests_",
    "_test_",
    "__tests__",
    "coverage",
    "test",
    "spec",
    "cypress",
    "e2e",
    "dist",
    "build",
    "out",
    "bin",
    "obj",
    "lib",
    "target",
    "release",
    "debug",
    "artifacts",
    "generated",
    ".git",
    ".svn",
    ".hg",
    ".vscode",
    ".idea",
    ".vs",
    "venv",
    ".venv",
    "env",
    ".env",
    "virtualenv",
    "envs",
    "docs",
    "javadoc",
    "logs",
    "android",
    "ios",
    "windows",
    "linux",
    "macos",
    "web",
    ".dart_tool",
    ".gradle",
    ".mvn",
    ".npm",
    ".yarn",
    "tmp",
    "temp",
    "uploads",
    "public",
    "static",
    "assets",
    "images",
    "media",
    "migrations",
    "data",
    "db",
    "database",
    ".github",
    ".circleci",
    ".husky",
    "storage",
    "vendor",
    "cmake-build-debug",
    "packages",
    "plugins",
    "bun.lock",
] as const;

</content>---### File /home/basedcatx/stuff/js/doxie/src/types.d.ts

Language: ts
<content>
interface FileInfo {
    readonly path: string;
    readonly relativePath: string;
    readonly size: number; // in KiB
    readonly ext: string;
    readonly opt?: string;
    readonly content: string;
}

</content>---### File /home/basedcatx/stuff/js/doxie/src/index.ts

Language: ts
<content>
import { findAllFilesInProjectDir } from "./fileh/fh";
import { generateFlattenedFileText, projectRootDir } from "./utility";

await generateFlattenedFileText(await findAllFilesInProjectDir());

</content>---### File /home/basedcatx/stuff/js/doxie/src/utility.ts

Language: ts
<content>
import path from "path";
import fs from "fs/promises";

export const isBun = typeof Bun != undefined;
export const projectRootDir = path.resolve(import.meta.dir || __dirname, "..");
export const projectRootSrcDir = path.resolve(import.meta.dir || __dirname);

export async function isHardDetectBinFiles(filePath: string): Promise<boolean> {
    try {
        const buffer = await fs.readFile(filePath);
        if ("\x00" in buffer) return true;
        const decoder = new TextDecoder("utf-8", { fatal: true });
        decoder.decode(buffer);
        return false;
    } catch (_) {
        return true;
    }
}

export function getFileExtension(fileName: string): string {
    return fileName.split(".").at(-1) || "unknown";
}

export async function generateFlattenedFileText(files: FileInfo[]) {
    const outdir = path.resolve(projectRootDir, "files.flatten.txt");
    const res = [];
    for (const file of files) {
        res.push(
            `### File ${file.path}\n${file.opt ?? ""}\nLanguage: ${file.ext}\n<content>\n${file.content}\n</content>`,
        );
    }
    const generate_content = res.join("---");
    isBun
        ? await Bun.write(outdir, generate_content)
        : await fs.writeFile(outdir, generate_content);
}

</content>---### File /home/basedcatx/stuff/js/doxie/package.json

Language: json
<content>
{
  "name": "doxie",
  "module": "index.ts",
  "type": "module",
  "private": true,
  "devDependencies": {
    "@types/bun": "latest"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}

</content>

</content>
---
### File /home/basedcatx/stuff/js/doxie/package.json

Language: JSON

<content>
{
  "name": "doxie",
  "module": "index.ts",
  "type": "module",
  "private": true,
  "devDependencies": {
    "@types/bun": "latest"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}


</content>
</content>

---

### File /home/basedcatx/stuff/js/doxie/package.json

Language: JSON

<content>
{
  "name": "doxie",
  "module": "index.ts",
  "type": "module",
  "private": true,
  "devDependencies": {
    "@types/bun": "latest"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}

</content>
</content>

---

### File /home/basedcatx/stuff/js/doxie/package.json

Language: JSON

<content>
{
  "name": "doxie",
  "module": "index.ts",
  "type": "module",
  "private": true,
  "devDependencies": {
    "@types/bun": "latest"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}

</content>