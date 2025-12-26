// Project runtime constants
export const _VERSION = "0.0.1" as const;
export const _NAME = "blinkdoc" as const;

// chalk colors
export const COLOR_QUESTION = chalk.bold.cyan;
export const COLOR_SUCCESS = chalk.green;
export const COLOR_ERROR = chalk.red;
export const COLOR_INFO = chalk.blue;
export const COLOR_HOLDER = chalk.dim.gray;
export const COLOR_WARNING = chalk.yellow;

import chalk from "chalk";
import { type RuntimeType } from "../types";
export enum RUNTIMES {
    Javascript = "Javascript & Typescript",
    Python = "Python",
    Rust = "Rust",
    C = "C/C++",
    Go = "Golang",
    ROR = "Ruby on Rails",
    Dart = "Dart",
    Java = "Java & /w Kotlin",
    PHP = "PHP",
    Zig = "Zig",
    PGSQL = "PostgresSQL",
    Docker = "Docker",
    Terraform = "Terraform",
    Kubernetes = "Kubernetes",
}

export const IGNORED_FILES_AND_EXTS = [
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

export const IGNORED_DIRS = [
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

export const PROJECT_RUNTIMES: RuntimeType[] = [
    {
        name: RUNTIMES.Javascript,
        files: [
            "package.json",
            "package-lock.json",
            "bun.lock",
            "pnpm-lock.json",
            "tsconfig.json",
        ],
        exts: ["js", "jsx", "tsx", "ts", "mjs"],
        frameworks: [
            { name: "Next JS", dependencies: ["next"], files: [] },
            { name: "TypeScript", dependencies: ["typescript"], files: [] },
            {
                name: "TarnStack Start",
                dependencies: ["@tarnstack/react-router", "@tanstack/react-start"],
                files: [],
            },
            { name: "Vue JS", dependencies: ["vue"], files: [] },
            { name: "Nuxt JS", dependencies: ["nuxt"], files: [] },
            { name: "Angular JS", dependencies: ["@angular/core"], files: [] },
            {
                name: "SvelteKit",
                dependencies: ["@sveltejs/kit"],
                files: [],
            },
            { name: "React JS", dependencies: ["react"], files: [] },
            { name: "Gatsby", dependencies: ["gatsby"], files: [] },
            { name: "Astro", dependencies: ["astro"], files: [] },
            { name: "Remix", dependencies: ["@remix-run/react"], files: [] },
            {
                name: "Express JS",
                dependencies: ["express"],
                files: [],
            },
            { name: "NestJs", dependencies: ["@nestjs/core"], files: [] },
            { name: "Fastify", dependencies: ["fastify"], files: [] },
            { name: "Koa", dependencies: ["koa"], files: [] },
            {
                name: "Electron JS",
                dependencies: ["electron"],
                files: [],
            },
            {
                name: "React Native",
                dependencies: ["react-native"],
                files: [],
            },
            { name: "Vite", dependencies: ["vite"], files: [] },
            { name: "Webpack", dependencies: ["webpack"], files: [] },
            { name: "Babel", dependencies: ["@babel/core"], files: [] },
            {
                name: "PrismaJS",
                dependencies: ["@prisma/client"],
                files: [],
            },
            { name: "DrizzleORM", dependencies: ["drizzle-orm"], files: [] },
            { name: "TypeORM", dependencies: ["typeorm"], files: [] },
            { name: "Sequelize", dependencies: ["sequelize"], files: [] },
            { name: "MongoDB", files: ["mongod.conf"], dependencies: [] },
            { name: "Firebase", dependencies: ["firebase"], files: [] },
            { name: "Supabase", dependencies: ["@supabase/supabase-js"], files: [] },
            { name: "Jest", dependencies: ["jest"], files: [] },
            { name: "Cypress", dependencies: ["cypress"], files: [] },
            { name: "Playwright", dependencies: ["@playwright/test"], files: [] },
            { name: "Vitest", dependencies: ["vitest"], files: [] },
            { name: "Eslint", dependencies: ["eslint"], files: [] },
            { name: "Prettier", dependencies: ["prettier"], files: [] },
            { name: "tRPC", dependencies: ["@trpc/server"], files: [] },
            { name: "GraphQL", dependencies: ["graphql"], files: [] },
        ],
    },
    {
        name: RUNTIMES.Python,
        files: ["requirements.txt", "pyproject.toml"],
        exts: ["py"],
        frameworks: [
            {
                name: "Django",
                files: ["manage.py", "settings.py"],
                dependencies: [],
            },
            { name: "Flask", files: ["app.py"], dependencies: [] },
            { name: "FastAPI", files: ["main.py"], dependencies: [] },
        ],
    },
    {
        name: RUNTIMES.Go,
        files: ["go.mod", "main.go"],
        exts: ["go"],
        frameworks: [],
    },
    {
        name: RUNTIMES.Rust,
        files: ["Cargo.toml", "src/main.rs"],
        exts: ["rs"],
        frameworks: [
            { name: "Tauri", dependencies: ["@tauri-apps/cli"], files: [] },
        ],
    },
    {
        name: RUNTIMES.Zig,
        files: ["main.zig", "build.zig", "build.zig.zon"],
        exts: ["zig"],
        frameworks: [],
    },
    {
        name: RUNTIMES.PHP,
        files: ["artisan.php"],
        exts: ["php"],
        frameworks: [
            {
                name: "Laravel",
                files: ["artisan", "composer.json"],
                dependencies: [],
            },
        ],
    },
    {
        name: RUNTIMES.Java,
        files: ["build.gradle"],
        exts: ["java", "kt"],
        frameworks: [
            {
                name: "SpringBoot",
                files: ["pom.xml", "build.gradle"],
                dependencies: [],
            },
            {
                name: "Android(Kotlin/Java)",
                files: ["build.gradle", "AndroidManifest.xml"],
                dependencies: [],
            },
        ],
    },
    {
        name: RUNTIMES.Dart,
        exts: ["dart"],
        files: ["pubspec.yaml", "lib/main.dart"],
        frameworks: [
            {
                name: "Flutter",
                files: ["pubspec.yaml", "lib/main.dart"],
                dependencies: [],
            },
        ],
    },
    {
        name: RUNTIMES.ROR,
        files: ["Gemfile", "Rakefile"],
        exts: ["rb", "erb"],
        frameworks: [],
    },
    {
        name: RUNTIMES.PGSQL,
        files: ["init.sql"],
        exts: ["pgsql"],
        frameworks: [],
    },
    {
        name: RUNTIMES.Docker,
        files: ["Dockerfile", "docker-compose.yml"],
        exts: [],
        frameworks: [],
    },
    {
        name: RUNTIMES.Kubernetes,
        files: ["deployment.yaml", "service.yaml"],
        exts: [],
        frameworks: [],
    },
    {
        name: RUNTIMES.Terraform,
        files: ["main.tf", "variables.tf"],
        exts: ["tf", "tfvars"],
        frameworks: [],
    },
] as const;

export const DEFAULT_README_MD = `
You are an elite Technical Documentation Engineer.Your sole task is to generate a complete, professional, accurate, and concise README.md file based exclusively on the provided codebase context and any explicit template supplied.

Core Principles
- Accuracy above all: Never invent, assume, or hallucinate features, flags, behavior, dependencies, or structure.Everything must be directly traceable to the provided code, configuration files, comments, or existing documentation fragments.
- If something is ambiguous or not clearly present in the context, either describe it conservatively(e.g., "appears to support...") or omit it.
- Prioritize clarity, precision, and usability for developers.

Template Priority
- If a README template(partial or full) is explicitly provided in the context, follow its exact structure, section order, styling, badges, emojis, and tone precisely.Preserve all decorative and branding elements.
- If no template is provided, use the Standard Professional Layout defined below.

Voice and Tone
Adopt the project's voice using this strict priority order:
1. Tone evident in code comments, docstrings, variable / function names, or existing documentation fragments.
2. Tone of any provided template or existing README snippets.
3. Tone of the user's message (if distinctly dry/academic or direct/punchy).
4. Default: clear, professional, concise, and neutral—no hype, no fluff.

Standard Professional Layout(use only if no template is provided)

Use clean Markdown with meaningful headings.Avoid unnecessary emojis unless they serve a clear functional purpose(e.g., check / x in status lists).

1. Project Header Image(optional but recommended if applicable)
If the project appears to have a visual component(UI, output, architecture), include:
![Project Overview](https://via.placeholder.com/1400x600.png?text=Replace+with+project+screenshot+or+architecture+diagram)
    <!--Recommended: Capture the main interface, example output, workflow diagram, or key visual that represents the project-- >

2. Project Name and Summary

A one - to two - sentence technical summary of what the project does, derived directly from entry points, main module purpose, or prominent comments.

3. Repository Structure
Provide an ASCII directory tree of the key structure:

├── src /          # Core source code
├── tests /        # Test suite
├── docs /         # Additional documentation
├── README.md     # This file
└── ...
    
Briefly describe the purpose of each major directory or important file.


4. Features
Bullet list of actual capabilities observed in the code logic.Be specific and conservative.
- Example: "Parses JSON input from stdin"
    - Example: "Supports --verbose and --output flags"

5. Installation
Step - by - step instructions derived from package.json, pyproject.toml, requirements.txt, setup.py, go.mod, etc.
Include exact commands(e.g., pip install - r requirements.txt, npm install).

6. Quick Start
Minimal steps to get a working example after installation.
Include code blocks with real example commands based on entry points(e.g., main.py, index.js, bin / script).

7. CLI Usage & Flags(if applicable)
If the project has a command - line interface, provide:
- The primary command
    - A table or formatted list of all flags / arguments parsed in the code(e.g., via argparse, click, commander, cobra, flags, etc.)
Example:
Usage
    mytool[command][options]

Flags
    | Flag | Description | Default |
| -------------------| --------------------------------------| -----------|
| --input<file> | Path to input file(required) | -         |
| --verbose, -v | Enable verbose output | false |
| --format<type> | Output format(json, yaml, csv) | json |

8. Development(if applicable)
Include only if evidence exists(e.g., test directory, scripts in package.json, make targets):
- How to run tests
    - How to lint / format
        - How to build

9. Contributing(only if applicable)
Include only if CONTRIBUTING.md, .github / CONTRIBUTING.md, or clear contribution guidelines exist in context.

10. License(only if applicable)
Include only if a LICENSE file, license field in package.json / pyproject.toml, or SPDX header is present.State the license name and link if possible.

11. Credits / Contributors(only if applicable)
Include only if AUTHORS, CONTRIBUTORS.md, or visible contributor credits exist.

Edge Cases & Context Limitations
- If the provided codebase is partial or incomplete, focus only on what is visible.Do not speculate about missing parts.
- Prioritize entry - point files(e.g., main.py, index.js, bin/*, setup.py, package.json) when analyzing.
- If key configuration is missing (e.g., no package.json or requirements.txt), note limitations clearly in the relevant section.

Final Output
Output only the complete README.md content in clean Markdown. Do not add explanations, notes, or wrappers outside the README itself.
`;
