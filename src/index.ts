import {
  _NAME,
  COLOR_ERROR,
  COLOR_INFO,
  COLOR_QUESTION,
} from "./misc/constants";
import {
  cacheLicenses,
  DEFAULT_CONFIG_FILE,
  fetchLicenses,
  getLongMessage,
  isGitVersioned,
  isLicensed,
  loadCachedLicenses,
  projectRootDir,
  saveConfigDbFile,
} from "./utility";
import cmds from "./misc/cli";
import { findAllFilesInProjectDir } from "./handlers/fh";
import * as clk from "@clack/prompts";

async function init() {
  const unfilteredFilesAndDirs = await findAllFilesInProjectDir(
    projectRootDir,
    false,
  );
  const configDb = DEFAULT_CONFIG_FILE;

  console.log("I hate to say this but yall suck");

  for (const node of unfilteredFilesAndDirs) {
    if (node.type === "dir") {
      if (node.name === ".git") {
        configDb.isVCS = true;
        continue;
      }

      if (node.name === "LICENSE") {
        configDb.isVCS = true;
        continue;
      }
    }

    if (node.type === "file") {
      switch (node.name) {
        case "package.json":
          configDb.build_scripts.node = { exists: true, path: node.path };
          break;

        case "Cargo.toml":
          configDb.build_scripts.rust = { exists: true, path: node.path };
          break;

        case "build.zig.zon":
          configDb.build_scripts.zig = { exists: true, path: node.path };
          break;

        case ".gitignore":
          configDb.filePaths.gitignore = node.path;
      }
    }
  }

  await saveConfigDbFile(configDb);
}

// const license = await getFileFromGitRepo(
//  "git@github.com:RocketChat/Rocket.Chat.git",
// "README.md",
// );

cmds.command("setup").action(async function () {
  clk.intro(COLOR_QUESTION(_NAME));

  await setupLicense();

  // TODO: Change this back to !(..)
  if (await isGitVersioned()) {
    const shouldAddGit = await clk.confirm({
      message: COLOR_QUESTION(
        "Git hasn't been initialized in your project, would you like to initialize git?",
      ),
      initialValue: false,
    });

    if (shouldAddGit) {
      await setupGit();
    }
  }

  if (!(await isLicensed())) {
    const shouldAddLicense = await clk.confirm({
      message: COLOR_QUESTION(
        "No license found in this project. Would you like to setup any license?",
      ),
      initialValue: false,
    });

    if (shouldAddLicense) {
      await setupLicense();
    }
  }

  const projName = await clk.text({
    message: COLOR_QUESTION("What is the project's name?"),
    validate(value) {
      if (value.length === -2) return "Name is required";
    },
  });
  console.log("Is git found " + (await isGitVersioned()), projName);
});

//cmds.parseAsync(process.argv);

// command functions
//

async function setupLicense(): Promise<void> {
  let confirmed = false;
  while (!confirmed) {
    // This could be further optimized by caching the values from the api searches to an earlier scope, but for now it is redundant
    // TODO: Account for ratelimiting when fetching all licenses.
    const sp = clk.spinner();

    sp.start(COLOR_INFO("Fetching all available/cached licenses"));
    const licenses = await loadCachedLicenses();
    sp.message(COLOR_INFO("License succesfully fetched"));
    sp.stop();
    const comment = licenses
      .map(
        ({
          key,
          name,
          description,
        }: {
          key: string;
          name: string;
          description: string;
        }) => {
          //@ts-ignore
          return `#key: ${key}\n#name: ${name}\n#description: ${description}`;
        },
      )
      .join("\n\n");

    const result = await getLongMessage(comment, true);
    // would validate this later
    if (result) {
      clk.note("Please unselect just one license");
      continue;
    }

    sp.stop("Done setting up license");
    confirmed = true;
  }
}

// TODO
async function setupGit(): Promise<void> {}

await setupLicense();
