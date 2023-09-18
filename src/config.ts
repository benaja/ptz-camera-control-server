import { z } from "zod";
import fs from "fs";
import logger from "./logger";

const schema = z.object({
  cameras: z.array(
    z.object({
      url: z.string(),
    })
  ),
});

export type Config = z.infer<typeof schema>;

/**
 * Loads the config file from the given path. If the file is not found or the
 * file is not valid JSON, the process will exit with an error.
 */
export function loadConfig(configPath: string): Config {
  let jsonConfig: undefined;

  try {
    jsonConfig = JSON.parse(fs.readFileSync(configPath).toString());
  } catch (error) {
    const typedError = error as Error;
    logger.error(typedError.message);
    process.exit(1);
  }

  const config = schema.safeParse(jsonConfig);

  if (!config.success) {
    logger.error(config.error.message);
    process.exit(1);
  }

  return config.data;
}
