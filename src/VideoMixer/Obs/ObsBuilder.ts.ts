import { IBuilder, IConfig, IVideoMixer } from "@/core";
import { Obs } from "./Obs";

export class ObsBuilder implements IBuilder<IVideoMixer> {
  public supportedTypes(): Promise<string[]> {
    return Promise.resolve(["obs/default"]);
  }

  public async build(config: IConfig): Promise<IVideoMixer> {
    const mixer = new Obs(config);
    return mixer;
  }
}
