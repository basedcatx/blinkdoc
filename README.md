A CLI tool that scans your codebase and generates documentation using LLMs. It detects your project's runtime, frameworks, git metadata, and license — then feeds structured context to an AI provider to produce a README.

> **Status:** Active development. Not yet ready for production use.

## How It Works

```
your-project/
    ├── source files
    ├── package.json / Cargo.toml / etc.
    └── .git/
         │
         ▼
   ┌─────────────┐
   │  blinkdoc    │
   │  CLI setup   │
   └─────┬───────┘
         │
    ┌────┴─────────────────────────┐
    │                              │
    ▼                              ▼
┌──────────────┐         ┌─────────────────┐
│ File Scanner │         │ Git Integration │
│ - recursive  │         │ - user details  │
│   traversal  │         │ - remote URL    │
│ - binary     │         │ - GitHub API    │
│   detection  │         │   (repo info,   │
│ - .gitignore │         │    community    │
│   parsing    │         │    profile)     │
└──────┬───────┘         └────────┬────────┘
       │                          │
       ▼                          ▼
┌──────────────────────────────────────┐
│  Runtime & Framework Detection       │
│  14 runtimes, 30+ frameworks         │
│  (file signatures + dependency scan) │
└──────────────────┬───────────────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ LLM Generation  │
          │ (Groq / Gemini) │
          │ Zod-validated   │
          └────────┬────────┘
                   │
                   ▼
            README.md output
```

## Features

- **Recursive file scanning** with binary file detection (null byte + UTF-8 decode check)
- **Runtime detection** for JavaScript/TypeScript, Python, Rust, Go, Zig, PHP, Java/Kotlin, Dart, Ruby, Docker, Kubernetes, Terraform, and more
- **Framework detection** — identifies 30+ frameworks (Next.js, React, Vue, Django, Flask, FastAPI, Spring Boot, Flutter, Laravel, etc.) by inspecting dependency manifests and file signatures
- **Git metadata extraction** — reads local git config and queries the GitHub REST API for repo stats, community profile, and commit activity
- **License management** — interactive license selection via GitHub's license API with local caching
- **Configurable ignore patterns** — merges a 160+ entry default ignore list with `.gitignore`, `.git/info/exclude`, and custom `.blinkignore` files
- **Config persistence** — stores scan results in `.blinkdoc/cdb.json` to avoid redundant filesystem passes
- **AI-powered generation** with structured output validated against a Zod schema

## Supported Runtimes

| Runtime | Detected By | Frameworks |
|---------|------------|------------|
| JavaScript/TypeScript | `package.json`, `tsconfig.json`, `bun.lock` | Next.js, React, Vue, Angular, Svelte, Astro, Express, NestJS, Fastify, Electron, React Native, and more |
| Python | `requirements.txt`, `pyproject.toml` | Django, Flask, FastAPI |
| Rust | `Cargo.toml`, `src/main.rs` | Tauri |
| Go | `go.mod`, `main.go` | — |
| Zig | `build.zig`, `build.zig.zon` | — |
| Java/Kotlin | `build.gradle` | Spring Boot, Android |
| Dart | `pubspec.yaml` | Flutter |
| PHP | `artisan.php` | Laravel |
| Ruby | `Gemfile`, `Rakefile` | — |
| Docker | `Dockerfile`, `docker-compose.yml` | — |
| Kubernetes | `deployment.yaml`, `service.yaml` | — |
| Terraform | `main.tf`, `variables.tf` | — |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/basedcatx/blinkdoc.git
cd blinkdoc

# Install dependencies
bun install

# Run the setup command
bun run src/index.ts setup
```

### Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
# or
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
```

## Project Structure

```
src/
├── index.ts              # CLI entrypoint and setup command
├── types.d.ts            # Type definitions
├── utility.ts            # Core utilities (config, git, file helpers)
├── api/
│   ├── ai.ts             # LLM integration (Groq / Gemini)
│   └── gitapi.ts         # GitHub REST API client
├── file/
│   ├── constants.ts      # Default ignore patterns (160+ entries)
│   └── fileSearch.ts     # Glob-based file search with ignore merging
├── handlers/
│   └── fh.ts             # File enumeration and framework detection
├── lib/
│   └── schema.ts         # Zod schema for AI response validation
└── misc/
    ├── cli.ts            # Commander CLI definition
    └── constants.ts      # Runtime/framework definitions, color helpers
```

## Tech Stack

| Category | Tool | Purpose |
|----------|------|---------|
| Runtime | Bun | Fast JS/TS runtime |
| Language | TypeScript | Type safety |
| CLI | Commander, @clack/prompts | Command parsing, interactive prompts |
| AI | Vercel AI SDK, Groq SDK, @ai-sdk/google | LLM text generation |
| Validation | Zod | Structured AI response validation |
| File Search | globby, fast-glob | Glob pattern matching with ignore support |
| Config Parsing | toml, json5, fast-xml-parser | Multi-format dependency manifest parsing |
| Security | secretlint | Prevent accidental secret exposure |
| AST | web-tree-sitter | Source code parsing (planned) |

## Roadmap

- [ ] Wire AI generation end-to-end with file context
- [ ] Framework detection for non-JS runtimes
- [ ] Custom `.blinkignore` configuration
- [ ] Multiple output formats (Markdown, XML)
- [ ] In-code commenting via LLM markers
- [ ] Git commit message style matching
- [ ] Secret detection before sending context to LLM
- [ ] Tree-sitter-based code analysis
