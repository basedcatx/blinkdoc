import { Command } from "commander";
import { _VERSION } from "./constants";

const cmds = new Command()
    .name("blinkdoc")
    .version(_VERSION)
    .description("A tool to reduce friction, in writing docs for your projects");

export default cmds;
