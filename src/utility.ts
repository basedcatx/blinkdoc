import path from "path";
import fs from "fs/promises";
import nodefs from "node:fs";
import type { FileInfo, GitRepoProfile, GitUserProfile } from "./types";
import toml from "toml";
import { exec } from "node:child_process";
import util from "node:util";
import { todo } from "node:test";
const execAsync = util.promisify(exec);

export const isBun = typeof Bun != undefined;

export const projectRootDir = path.resolve(
    import.meta.dir ?? import.meta.dirname,
    "..",
);
export const projectRootSrcDir = path.resolve(
    import.meta.dir ?? import.meta.dirname,
);
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
    return fileName.toLowerCase().split(".").at(-1) || "unknown";
}

export async function generateFlattenedFileText(files: FileInfo[]) {
    const outdir = path.resolve(doxieOutputDir, "flatten.md");
    const res = [];
    for (const file of files) {
        res.push(
            `### File ${file.path}\n${file.opt ?? ""}\nLanguage: ${file.ext.toUpperCase()}\n\n<content>\n${file.content}\n</content>`,
        );
    }
    const generate_content = res.join("\n\n");
    isBun
        ? await Bun.write(outdir, generate_content)
        : await fs.writeFile(outdir, generate_content);
}

// TODO: We would have to serialize every important generated file from  this structure as a single file unit, and also keep some sort of a config file.
// The purpose of this is to ease optimization such that when we need a particular file, we don't have to go start searching for it anymore from a list of files.
// Also with time we would make sure that all our searches would be binary searches.

export function isFoundInDeps(dir: FileInfo, d: string) {
    const ext = getFileExtension(dir.name || "");
    const file = nodefs.readFileSync(dir.path, "utf8");
    switch (ext) {
        case "json":
            try {
                const obj = JSON.parse(file);
                return (
                    d in obj["dependencies"] ||
                    d in obj["devDependencies"] ||
                    d in obj["peerDependencies"]
                );
            } catch (_) {
                console.log(_);
                return false;
            }
        case "toml":
            try {
                const obj = toml.parse(file);
                return d in obj.dependencies;
            } catch (_) {
                return false;
            }
    }
    return false;
}

// A utility function to quickly find, add frameworks based on their package deps, or files.
export function findAndAddFws(
    framework: { files: string[]; dependencies: string[] },
    files: FileInfo[],
    script: FileInfo | undefined = undefined,
): string[] {
    const res: string[] = [];
    if (!script) {
        framework.files.forEach(function(fname) {
            if (files.some((file) => fname === file.name)) {
                res.push(fname);
            }
        });
        return res;
    }
    framework.dependencies.forEach((dep) => {
        if (isFoundInDeps(script, dep)) res.push(dep);
    });
    return res;
}

export async function getGitUserDetails(): Promise<GitUserProfile | undefined> {
    const { stdout: name, stderr: nameE } = await execAsync(
        "git config user.name",
        {
            encoding: "utf-8",
        },
    );

    const { stdout: email, stderr: emailE } = await execAsync(
        "git config user.email",
        {
            encoding: "utf-8",
        },
    );

    if (nameE || emailE) {
        return undefined;
    }

    return { name: name.trim(), email: email.trim() };
}

export async function getGitRepoDetails(): Promise<GitRepoProfile | undefined> {
    const { stdout: remoteString, stderr } = await execAsync("git remote", {
        encoding: "utf-8",
    });
    if (
        stderr ||
        remoteString.trim() === "" ||
        remoteString.split("\n").length < 1
    )
        return undefined;

    const remotes = remoteString.split("\n").map((r) => r.trim());
    // We assume the very first remote, is the master or the main github repository.
    const { stdout: urlString } = await execAsync(
        `git remote get-url ${remotes[0]}`,
        {
            encoding: "utf-8",
        },
    );

    let repoUrl = urlString.trim().replace(".git", "");

    if (repoUrl.startsWith("git@github")) {
        repoUrl = repoUrl.split(":")[1]!;
    } else {
        repoUrl = (function(): string {
            const repoTokens = repoUrl.split("/");
            if (repoTokens.length < 2) return "";
            const first = repoTokens.at(-2);
            const last = repoTokens.at(-1);
            return first!.concat("/").concat(last!);
        })();
    }

    /// From here, we can just incorperate the git api and form our final json body.....

    console.log(repoUrl);
}
