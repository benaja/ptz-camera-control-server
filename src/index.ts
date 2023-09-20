#!/usr/bin/env node

import yargs from "yargs";
import { loadConfig } from "./config";
import { Core } from "core";
import { PassthroughBuilder } from "./VideoMixer/Passthrough/PassthroughBuilder";
import logger, { legacyLogger } from "./logger";
import { Dualshock4Builder } from "./Hmi/Gamepad/ps4/dualshock4/Dualshock4Builder";

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

  const core = new Core();
  await core.mixerFactory.builderAdd(new PassthroughBuilder(), legacyLogger);
  await core.hmiFactory.builderAdd(
    new Dualshock4Builder(legacyLogger, core.mixerFactory, core.cameraFactory),
    legacyLogger
  );

  await core.bootstrap(legacyLogger, config);
}

run();
