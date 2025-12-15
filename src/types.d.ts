interface FileInfo {
    readonly path: string;
    readonly relativePath: string;
    readonly size: number; // in KiB
    readonly ext: string;
    readonly opt?: string;
    readonly content: string;
    readonly name: string;
}

export type ProjectProfile = {
    name?: string;
    root: string;
    languages: { name: string; confidence: number }[];
    runtime?: string;
    frameworks: { name: string; confidence: number };
    pm?: string;
    hasCli?: boolean;
    hasAPI?: boolean;
    hasFrontend?: boolean;
    dependencies?: string[];
    files?: string[];
};

export interface RuntimeType {
    files: string[];
    exts: string[];
    frameworks: Record<
        string,
        {
            files?: string[];
            dependencies?: string[];
        }
    >;
}

export type GitProfile = {
    version?: string;
    license?: string;
    description?: string;
    author?: string;
    email?: string;
    repository?: string;
    gitstars?: number;
    gitbadges: string;
};
