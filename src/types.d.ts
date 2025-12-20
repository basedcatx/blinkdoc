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

export type StrippedGitResponse = {
    stargazers_count: number;
    watchers_count: number;
    watchers: number;
    license: null | License;
    topics: string[];
    main_language: string;
    has_readme: boolean;
    health_percentage: number;
};

export type License = {
    key: string;
    name: string;
    url: string;
};

export type GitRepoProfile = {
    license:
    | { isFound: false }
    | { isFound: true; name: string; content: string };
    description?: string;
    repository: string;
    gitstars: number;
    gitbadges: string;
};
