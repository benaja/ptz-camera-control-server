#!/usr/bin/env node

import yargs from "yargs";
import { loadConfig } from "./config";

async function run() {
  const args = await yargs(process.argv.slice(2)).options({
    config: {
      type: "string",
      description: "Path to config file",
      demandOption: true,
      alias: "c",
    },
  }).argv;

  const config = await loadConfig(args.config);

  console.log(config);
}

run();
