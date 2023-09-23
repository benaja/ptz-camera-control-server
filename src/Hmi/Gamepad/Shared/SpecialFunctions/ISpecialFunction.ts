import { IVideoMixer } from "@/core";

export interface ISpecialFunction {
  run(mixer: IVideoMixer): void;
}
