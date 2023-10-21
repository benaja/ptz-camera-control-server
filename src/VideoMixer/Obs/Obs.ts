import {
  IConfig,
  IConnection,
  IImageSelectionChange,
  IVideoMixer,
} from "@/core";

import { EventEmitter } from "events";
import { StrictEventEmitter } from "strict-event-emitter-types";
import ObsWebSocket from "obs-websocket-js";
import { throttle } from "@/utils";
import { debounce } from "lodash";

export class Obs implements IVideoMixer {
  private readonly _selectedChangeEmitter =
    new EventEmitter() as StrictEventEmitter<
      EventEmitter,
      IImageSelectionChange
    >;
  private _currentOnAir = 0;
  private _currentPreview = 0;
  private _obs: ObsWebSocket;

  constructor(_config: IConfig) {
    this._obs = new ObsWebSocket();
    this._obs.connect("ws://127.0.0.1:4455").then(() => {
      console.log(`Successfully connected to OBS!`);

      this._obs.on("CurrentPreviewSceneChanged", async (data) => {
        this._currentPreview = await this.getSceneIndex(data.sceneName);
        this.sceneChanged();
      });
      this._obs.on("CurrentProgramSceneChanged", async (data) => {
        this._currentOnAir = await this.getSceneIndex(data.sceneName);
        this.sceneChanged();
      });
    });
  }

  private sceneChanged = debounce(async () => {
    console.log("preview: ", this._currentPreview);
    console.log("onair: ", this._currentOnAir);
    this._selectedChangeEmitter.emit(
      "previewChange",
      this._currentPreview,
      this._currentOnAir === this._currentPreview
    );
  }, 10);

  private async getSceneIndex(name: string): Promise<number> {
    const scenes = await this._obs.call("GetSceneList");
    const scene = scenes.scenes.find((s) => s.sceneName === name);

    if (!scene) {
      throw new Error(`Scene ${name} not found`);
    }

    return (scene.sceneIndex as number) + 1;
  }

  public get connectionString(): string {
    return "obs";
  }

  public async isKeySet(_key: number): Promise<boolean> {
    return false;
  }

  public async getAuxilarySelection(_aux: number): Promise<number> {
    return Promise.resolve(0);
  }

  public imageSelectionChangeGet(): StrictEventEmitter<
    EventEmitter,
    IImageSelectionChange
  > {
    return this._selectedChangeEmitter;
  }

  public cut(): void {
    const oldPreview = this._currentPreview;
    this._currentPreview = this._currentOnAir;
    this._currentOnAir = oldPreview;
    this._selectedChangeEmitter.emit(
      "previewChange",
      this._currentOnAir,
      false
    );
  }

  public auto(): void {
    const oldPreview = this._currentPreview;
    this._currentPreview = this._currentOnAir;
    this._currentOnAir = oldPreview;
    this._selectedChangeEmitter.emit(
      "previewChange",
      this._currentOnAir,
      false
    );
  }

  public changeInput(newInput: number): void {
    this._currentPreview = newInput;
    this._selectedChangeEmitter.emit(
      "previewChange",
      this._currentOnAir,
      false
    );
  }

  public toggleKey(_key: number): void {
    // intentionally nothing
  }

  public runMacro(_macro: number): void {
    // intentionally nothing
  }

  public subscribe(i: IConnection): void {
    i.change(true);
  }

  public unsubscribe(_i: IConnection): void {
    // intentionally nothing
  }

  dispose(): Promise<void> {
    return Promise.resolve();
  }
}
