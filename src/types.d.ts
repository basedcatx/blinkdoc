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
    ctx: Omit<RuntimeType, "frameworks" | "exts"> & { frameworks: string[] };
    hasFrontend?: boolean;
};

export interface RuntimeType {
    name: RUNTIMES;
    files: string[];
    exts: string[];
    frameworks: {
        name: string;
        files: string[];
        dependencies: string[];
    }[];
}

export type GitUserProfile = { name: string; email: string };

//TODO: Tomorrow
export type GitRepoProfile = {
    license:
    | { isFound: false }
    | { isFound: true; name: string; content: string };
    description?: string;
    repository: string;
    gitstars: number;
    gitbadges: string;
};
