import { z } from "zod";
import fs from "fs";
import logger from "./logger";
import { VideoMixerType } from "./VideoMixer";

const schema = z.object({
  cams: z.array(
    z.object({
      type: z.string(),
      instance: z.number(),
      connectionUrl: z.string(),
      connectionPort: z.string(),
    })
  ),
  videoMixers: z.array(
    z.object({
      type: z.nativeEnum(VideoMixerType),
      instance: z.number(),
    })
  ),
  interfaces: z.array(
    z.object({
      type: z.string(),
      instance: z.number(),
      cameraMap: z.record(z.number()),
      connectionChange: z.object({
        default: z.object({
          up: z.number(),
          down: z.number(),
          left: z.number(),
          right: z.number(),
        }),
      }),
      specialFunction: z.object({
        default: z.object({}),
      }),
      videoMixer: z.number(),
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
