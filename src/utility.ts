import path from "path";
import { tmpdir } from "os";
import fs from "fs/promises";
import nodefs, { unlinkSync } from "node:fs";
import { spawn, exec } from "child_process";
import readline from "readline";

import type {
  FileInfo,
  GitRepoProfile,
  GitUserProfile,
  ConfigDB,
  UFileInfo,
} from "./types";

import toml from "toml";
import util from "node:util";
import { GitAPIManager } from "./api/gitapi";
import { IGNORED_DIRS, IGNORED_FILES_AND_EXTS } from "./misc/constants";
import { globalConfig } from "zod/v4/core";
import cmds from "./misc/cli";
const execAsync = util.promisify(exec);

export const isBun = typeof Bun != undefined;

// For now, we have to use the .. to step back one dir, but in prod we have to remove this, else, everything fails.
export const projectRootDir = path.resolve(
  import.meta.dir ?? import.meta.dirname,
  "..",
);

export const configRootDir = path.resolve(projectRootDir, ".blinkdoc/");
export const configDBFile = path.resolve(configRootDir, "cdb.json");
export const DEFAULT_CONFIG_FILE: ConfigDB = {
  isVCS: false,
  isLicensed: false,
  filePaths: { gitignore: "", license: "" },
  build_scripts: {
    node: { exists: false },
    rust: { exists: false },
    zig: { exists: false },
  },
};

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
  // Would have to export this to other file types as well.
  const outdir = path.resolve(configRootDir, "flatten.md");
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
    framework.files.forEach(function (fname) {
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

export function parseGitRepoUrl(rawUrlString: string): string {
  let repoUrl = rawUrlString.trim().replace(".git", "");

  if (repoUrl.startsWith("git@github")) {
    repoUrl = repoUrl.split(":")[1]!;
  } else {
    repoUrl = (function (): string {
      const repoTokens = repoUrl.split("/");
      if (repoTokens.length < 2) return "";
      const first = repoTokens.at(-2);
      const last = repoTokens.at(-1);
      return first!.concat("/").concat(last!);
    })();
  }

  return repoUrl;
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

  const GitAPI = new GitAPIManager(urlString);
  console.log(await GitAPI.getRepoInfo());
}

export async function getFileFromGitRepo(
  repo: string,
  file: string,
): Promise<string | undefined> {
  const fetchUrl = async function (url: string) {
    return fetch(url)
      .then((r) => {
        // I mean, if this should be the case then it's the github 404 error, so the file is most likely not found.
        if (!r.ok) throw new Error(undefined);
        return r.text();
      })
      .then((text) => {
        if (text.trim.length) {
          // Most likely an invalid file or whatsoever i don't really know i can't say for sure.
          return Promise.reject(undefined);
        }
        return text;
      });
  };

  const parsedRepoMain = `https://raw.githubusercontent.com/${parseGitRepoUrl(repo)}/master/${file}`;
  const parsedRepoMaster = `https://raw.githubusercontent.com/${parseGitRepoUrl(repo)}/master/${file}`;

  // My little hack to try getting results from both branches, just to make sure either of them exists.
  const res = await Promise.any([
    fetchUrl(parsedRepoMain),
    fetchUrl(parsedRepoMaster),
  ]);

  return res;
}

export async function saveConfigDbFile(config: ConfigDB): Promise<void> {
  await fs.mkdir(configRootDir, { recursive: true });
  return await fs.writeFile(configDBFile, JSON.stringify(config, null, 2));
}

export async function loadConfigDbFile(): Promise<ConfigDB> {
  if (!(await fs.exists(configDBFile)))
    await saveConfigDbFile(DEFAULT_CONFIG_FILE);
  return JSON.parse(await fs.readFile(configDBFile, { encoding: "utf-8" }));
}

export async function isGitVersioned(): Promise<boolean> {
  return (await loadConfigDbFile()).isVCS;
}

export async function isLicensed(): Promise<boolean> {
  return (await loadConfigDbFile()).isLicensed;
}

export async function filterFilesAndDir(
  files: UFileInfo[],
): Promise<FileInfo[]> {
  const config = await loadConfigDbFile();
  const nodes: string[] = [...IGNORED_FILES_AND_EXTS];
  const dirs: string[] = [...IGNORED_DIRS];

  // Trying to parse .gitignore, would improve on this later.
  if (config.filePaths.gitignore.length > 1) {
    try {
      const contents = await fs.readFile(config.filePaths.gitignore, {
        encoding: "utf-8",
      });

      for (const c of contents.split("\n")) {
        const cPath = path.join(projectRootDir, c);
        const t = await fs.stat(cPath);
        if (t.isDirectory()) {
          dirs.push(c);
        } else if (t.isFile()) {
          nodes.push(c);
        }
      }
    } catch (_) {}
  }

  const res: FileInfo[] = [];
  for (const file of files) {
    if (file.type === "dir") {
      if (!dirs.includes(file.name)) {
        await filterFilesAndDir(file.contents);
        continue;
      }
    }
    if (!nodes.includes(file.name)) {
      res.push(file as FileInfo);
    }
  }

  return res;
}

export async function getLongMessage(comments?: string) {
  const tempFileDir = path.join(tmpdir(), `blinkdoc-${Date.now()}.txt`);
  await fs.writeFile(tempFileDir, comments || "");
  let editor = process.env.EDITOR! || "nano";

  return new Promise((resolve) => {
    const child = spawn(editor, [tempFileDir], { stdio: "inherit" });

    child.on("close", async () => {
      const fileStream = nodefs.createReadStream(tempFileDir);

      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });
      const result: string[] = [];

      for await (const line of rl) {
        if (line.startsWith("#")) continue;
        result.push(line);
      }

      unlinkSync(tempFileDir);
      return resolve(result.join("\n"))
    });
  });
}

console.log(await getLongMessage("Uhm I should see this"));
