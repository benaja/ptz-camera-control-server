#!/usr/bin/env node

import yargs from "yargs";
import path from "path";
import winston from "winston";
import fs from "fs";
import configSchema from "./configSchema";

async function run() {
  const args = await yargs(process.argv.slice(2)).options({
    config: {
      type: "string",
      description: "Path to config file",
      demandOption: true,
      alias: "c",
    },
  }).argv;

  const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ],
  });

  let jsonConfig: undefined;

  try {
    jsonConfig = JSON.parse(fs.readFileSync(args.config).toString());
  } catch (error) {
    const typedError = error as Error;
    logger.error(typedError.message);
    return;
  }

  const config = configSchema.safeParse(jsonConfig);

  if (!config.success) {
    logger.error(config.error.message);
    return;
  }
}

run();
