import { globby as gb, type Options as GlobbyOptions } from "globby";
import type { Stats } from "node:fs";
import fs from "node:fs/promises";
import { defaultIgnoreList } from "./constants";
import path from "node:path";
import { trim } from "zod";
import { projectRootDir } from "../utility";

export async function searchFiles(rootDir: string) {
  let pathStats: Stats;
  try {
    pathStats = await fs.stat(rootDir);
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error) {
      const errCode = (error as NodeJS.ErrnoException).code;

      //TODO
      if (errCode === "ENOENT") {
        console.error("Specified path not found: " + rootDir);
        throw new Error("Specified path not found: " + rootDir);
      }

      //TODO
      if (errCode === "EPERM" || errCode === "EACCESS") {
        console.error(
          "Permission denied, while accessing path. Would be fixed soon: " +
            rootDir,
        );

        // would be changed to our own custom error class in due time.

        throw new Error(
          "Permission denied, while accessing path. Would be fixed soon: " +
            rootDir,
        );
      }
    }

    console.error("Unknown error while accessing specified path: " + rootDir);
    console.error(error);
    throw new Error("Unknown error while accessing root dir: " + rootDir);
  }

  if (!pathStats.isDirectory()) {
    throw new Error("The specified path is not a directory: " + rootDir);
  }

  const [normalizedIgnorePatterns, ignoreFilePatterns] = await Promise.all([
    processIgnorePatterns(rootDir),
    getIgnoreFilePatterns(),
  ]);

  // TODO: Add includePatterns from our config file.

  console.log((await processIgnorePatterns(rootDir)).find((p) => p.length > 0));
  const includePaths = ["**/*"];
  const filePaths = await gb(includePaths, {
    cwd: rootDir,
    onlyFiles: true,
    ignoreFiles: await getIgnoreFilePatterns(),
  });

  console.log(rootDir);
}

// would add config soon.

export function escapeGlobPattern(pattern: string): string {
  // First escape backslashes
  const escapedBackslashes = pattern.replace(/\\/g, "\\\\");
  // Then escape special characters () and [], but NOT {}
  return escapedBackslashes.replace(/[()[\]]/g, "\\$&");
}

export const normalizeGlobPattern = (pattern: string): string => {
  if (pattern.endsWith("/") && !pattern.endsWith("**/")) {
    return pattern.slice(0, -1);
  }

  if (pattern.startsWith("**/") && !pattern.endsWith("/**")) {
    return `${pattern}/**`;
  }

  return pattern;
};

function createBaseGlobbyOpts(
  rootDir: string,
  ignorePatterns: string[],
  ignoreFilePatterns: string[],
): GlobbyOptions {
  return {
    cwd: rootDir,
    ignore: ignorePatterns,
    ignoreFiles: ignoreFilePatterns,
    absolute: false,
    dot: true,
    followSymbolicLinks: false,
  };
}

async function getIgnoreFilePatterns(): Promise<string[]> {
  const res: string[] = [];

  // Once we have our config file, like repomix, we would check if we should include every .ignore file
  // For now, we can just use our own ignorefile
  res.push("**/.blinkignore");
  return res;
}

function parseIgnoreFileContents(fileString: string): string[] {
  if (!fileString) return [];
  return fileString.split("\n").reduce<string[]>(function (acc, line) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("#")) {
      acc.push(trimmed);
    }
    return acc;
  }, []);
}

// TODO: For now we don't yet support the gitree thingy, so let's just keep it simple.

async function processIgnorePatterns(rootDir: string) {
  const patterns = await getGeneralIgnorePatterns(rootDir);
  return patterns.map(normalizeGlobPattern);
}

async function getGeneralIgnorePatterns(rootDir: string): Promise<string[]> {
  const res: Set<string> = new Set();

  for (const pat of defaultIgnoreList) {
    res.add(pat);
  }
  // We want to log that in our debug.

  const excludedGitFilePath = path.join(rootDir, ".git", "info", "exclude");
  try {
    const excludeFileContents = await fs.readFile(excludedGitFilePath, "utf8");
    const ignorePatterns = parseIgnoreFileContents(excludeFileContents);
    for (const c of ignorePatterns) {
      res.add(c);
    }
  } catch (e: unknown) {
    // Once we have a logger class, we would log this error, just for logging sake
  }

  return Array.from(res);
}

await searchFiles(projectRootDir);
