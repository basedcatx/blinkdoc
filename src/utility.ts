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
    const generate_content = res.join("\n\n");
    isBun
        ? await Bun.write(outdir, generate_content)
        : await fs.writeFile(outdir, generate_content);
}
