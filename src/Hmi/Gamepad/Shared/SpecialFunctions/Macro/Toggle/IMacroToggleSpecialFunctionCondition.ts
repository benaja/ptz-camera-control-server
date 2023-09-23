import { IVideoMixer } from "@/core";

export interface IMacroToggleSpecialFunctionCondition {
  isActive(mixer: IVideoMixer): Promise<boolean>;
}
