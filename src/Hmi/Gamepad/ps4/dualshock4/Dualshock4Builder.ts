import * as ConfigSchema from "./IDualshock4Config.json";

import {
  CameraConnectionFactory,
  IBuilder,
  IConfig,
  IHmi,
  ILogger,
  VideomixerFactory,
} from "cgf.cameracontrol.main.core";
import { IDualshock4Config } from "./Dualshock4Config";
import { Dualshock4 } from "./Dualshock4";
import { ConfigValidator } from "../../../../ConfigValidator";

export class Dualshock4Builder implements IBuilder<IHmi> {
  constructor(
    private logger: ILogger,
    private mixerFactory: VideomixerFactory,
    private cameraFactory: CameraConnectionFactory
  ) {}
  supportedTypes(): Promise<string[]> {
    return Promise.resolve(["ps4/dualshock4"]);
  }

  build(config: IConfig): Promise<IHmi> {
    const configValidator = new ConfigValidator();
    const validConfig = configValidator.validate<IDualshock4Config>(
      config,
      ConfigSchema
    );

    if (validConfig === undefined) {
      return Promise.reject(configValidator.errorGet());
    }

    return Promise.resolve(
      new Dualshock4(
        validConfig,
        this.logger,
        this.mixerFactory,
        this.cameraFactory
      )
    );
  }
}
