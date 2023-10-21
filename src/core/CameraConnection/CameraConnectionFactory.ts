import { registerCameraConnectedListener } from "@/websocket";
import { Factory } from "../GenericFactory/Factory";
import { ICameraConnection } from "./ICameraConnection";
import { CgfPtzCamera } from "./CgfPtzCamera/CgfPtzCamera";
import { ILogger } from "../Logger/ILogger";
import { IConfig } from "../Configuration/IConfig";

export class CameraConnectionFactory extends Factory<ICameraConnection> {
  public async parseConfig(config: IConfig, logger: ILogger): Promise<void> {
    const builder = this._builders[config.type];
    if (builder === undefined) {
      logger.error(`Factory: Could not find builder for type:${config.type}`);
      return;
    }

    registerCameraConnectedListener(async (cameraId) => {
      if (this._instances[cameraId]) {
        logger.log(
          `Factory: Instance for index:${config.instance} is already available`
        );
        return;
      }

      console.log("building instance for cameraId: ", cameraId);

      this._instances[cameraId] = new CgfPtzCamera(cameraId, logger);
    });
  }
}
