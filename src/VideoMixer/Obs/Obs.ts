import {
  IConfig,
  IConnection,
  IImageSelectionChange,
  IVideoMixer,
} from "@/core";

import { EventEmitter } from "events";
import { StrictEventEmitter } from "strict-event-emitter-types";
import ObsWebSocket from "obs-websocket-js";

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

      this._obs.on("CurrentPreviewSceneChanged", (data) => {
        console.log(`CurrentPreviewSceneChanged`, data);
      });
    });
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
