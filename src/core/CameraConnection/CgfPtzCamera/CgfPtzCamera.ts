import axios, { AxiosInstance } from "axios";

import { CgfPtzCameraState } from "./CgfPtzCameraState";
import { EventEmitter } from "events";
import { Agent as HttpsAgent } from "https";
import { ICameraConnection } from "../ICameraConnection";
import { ICgfPtzCameraConfiguration } from "./ICgfPtzCameraConfiguration";
import { IConnection } from "../../GenericFactory/IConnection";
import { ILogger } from "../../Logger/ILogger";
import StrictEventEmitter from "strict-event-emitter-types";
import WebSocket from "ws";
import { clients } from "@/websocket";
import { throttle } from "@/utils";

export class CgfPtzCamera implements ICameraConnection {
  // private readonly axios: AxiosInstance;
  // private readonly socketConnection: signalR.HubConnection;
  private readonly currentState = new CgfPtzCameraState();
  private shouldTransmitState = false;
  private canTransmit = false;
  private _connected = false;
  private _connectionEmitter: StrictEventEmitter<EventEmitter, IConnection> =
    new EventEmitter();
  private websocket: WebSocket | undefined;

  constructor(public cameraId: number, private logger: ILogger) {
    this.searchForWebsocket();

    this.initialConnect().catch((error) =>
      this.logError(`Initial connection error:${error}`)
    );
  }

  private searchForWebsocket() {
    this.websocket = clients.get(this.cameraId);
    if (this.websocket) {
      console.log("websocket found");
      this.websocket.on("close", () => {
        this.searchForWebsocket();
      });
      return;
    }

    console.log("websocket not found, retrying in 1s: ", this.cameraId);
    setTimeout(() => {
      this.searchForWebsocket();
    }, 1000);
  }

  public get connected(): boolean {
    return this._connected;
  }
  public set connected(v: boolean) {
    this._connected = v;
    this._connectionEmitter.emit("change", v);
  }

  public async dispose(): Promise<void> {
    try {
      // await this.socketConnection.stop();
    } catch (error) {
      this.logError(`unable to stop socket connection - ${error}`);
    }
  }

  public subscribe(i: IConnection): void {
    this._connectionEmitter.on("change", i.change);
    i.change(this.connected);
  }

  public unsubscribe(i: IConnection): void {
    this._connectionEmitter.removeListener("change", i.change);
  }

  public pan(value: number): void {
    const newValue = this.multiplyRoundAndCrop(value * 255, 255);
    if (newValue === this.currentState.pan) return;

    this.currentState.pan = newValue;
    this.transmitNextState();
  }
  public tilt(value: number): void {
    const newValue = this.multiplyRoundAndCrop(value * 255, 255);
    if (newValue == this.currentState.tilt) return;

    this.currentState.tilt = newValue;
    this.transmitNextState();
  }
  public zoom(value: number): void {
    const newValue = this.multiplyRoundAndCrop(value * 8, 8);
    if (newValue == this.currentState.zoom) return;

    this.currentState.zoom = this.multiplyRoundAndCrop(value * 8, 8);
    this.transmitNextState();
  }
  public focus(value: number): void {
    const newValue = this.multiplyRoundAndCrop(value * 1.2, 1) > 0;
    if (newValue == this.currentState.focus) return;

    this.currentState.focus = newValue;
    this.transmitNextState();
  }

  private async initialConnect() {
    console.log("initialConnect");
    try {
      await this.connectionSuccessfullyEstablished();
    } catch (error) {
      this.logError(
        `Socket connection setup failed with error:${error} - retrying`
      );
      await this.initialConnect();
    }
  }

  private async connectionSuccessfullyEstablished() {
    console.log("connectionSuccessfullyEstablished");
    this.canTransmit = true;
    this.connected = true;
    await this.transmitNextState();
  }

  private transmitNextState = throttle(async () => {
    if (!this.canTransmit) return;
    if (!this.websocket) return;

    this.canTransmit = false;
    try {
      this.websocket?.send(JSON.stringify(this.currentState));
      this.canTransmit = true;
    } catch (error) {
      this.canTransmit = true;
      this.log(`state transmission error - ${error}`);
      await this.transmitNextState();
    }
  }, 5);

  private log(toLog: string) {
    this.logger.log(`CgfPtzCamera(${this.cameraId}):${toLog}`);
  }

  private logError(toLog: string) {
    this.logger.error(`CgfPtzCamera(${this.cameraId}):${toLog}`);
  }
  private multiplyRoundAndCrop(value: number, maximumAbsolute: number): number {
    const maximized = Math.max(
      -maximumAbsolute,
      Math.min(maximumAbsolute, value)
    );
    return Math.round(maximized);
  }
}
