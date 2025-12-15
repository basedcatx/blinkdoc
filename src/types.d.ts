interface FileInfo {
    readonly path: string;
    readonly relativePath: string;
    readonly size: number; // in KiB
    readonly ext: string;
    readonly opt?: string;
    readonly content: string;
}
