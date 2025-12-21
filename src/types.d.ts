interface FileInfo {
    readonly path: string;
    readonly relativePath: string;
    readonly size: number; // in KiB
    readonly ext: string;
    readonly opt?: string;
    readonly content: string;
    readonly name: string;
}

// This is to make sure we parse an unfiltered file list by mistake... It is like a way to separate concerns.
export type UFileInfo = (FileInfo & { type: "file" }) | { type: "dir", name: string, path: string, contents: UFileInfo[] };

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

type ConfigDBBuildScript = { exists: boolean, path?: string }
export type ConfigDB = {
    isVCS: boolean = false;
    isLicensed: boolean = false;
    filePaths: { gitignore: string, license: string; },
    build_scripts: {
        node: ConfigDBBuildScript,
        rust: ConfigDBBuildScript,
        zig: ConfigDBBuildScript
    }
};
