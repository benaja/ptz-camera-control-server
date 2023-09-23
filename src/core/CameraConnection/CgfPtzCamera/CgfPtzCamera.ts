import * as signalR from "@microsoft/signalr";

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

  constructor(
    private config: ICgfPtzCameraConfiguration,
    private logger: ILogger
  ) {
    // this.axios = axios.create({
    //   httpsAgent: new HttpsAgent({
    //     rejectUnauthorized: false,
    //   }),
    // });

    this.searchForWebsocket();

    this.initialConnect().catch((error) =>
      this.logError(`Initial connection error:${error}`)
    );
  }

  private searchForWebsocket() {
    this.websocket = clients.get(this.config.connectionUrl);
    if (this.websocket) {
      console.log("websocket found");
      this.websocket.on("close", () => {
        this.searchForWebsocket();
      });
      return;
    }

    console.log(
      "websocket not found, retrying in 1s: ",
      this.config.connectionUrl
    );
    setTimeout(() => {
      this.searchForWebsocket();
    }, 1000);
  }

  public get connectionString(): string {
    return this.config.connectionUrl;
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
    this.currentState.pan = this.multiplyRoundAndCrop(value * 255, 255);
    this.scheduleStateTransmission();
  }
  public tilt(value: number): void {
    this.currentState.tilt = this.multiplyRoundAndCrop(value * 255, 255);
    this.scheduleStateTransmission();
  }
  public zoom(value: number): void {
    this.currentState.zoom = this.multiplyRoundAndCrop(value * 8, 8);
    this.scheduleStateTransmission();
  }
  public focus(value: number): void {
    this.currentState.focus = this.multiplyRoundAndCrop(value * 1.2, 1);
    this.scheduleStateTransmission();
  }

  private async socketReconnected() {
    await this.setupRemote();
    await this.connectionSuccessfullyEstablished();
  }

  private async initialConnect() {
    console.log("initialConnect");
    await this.setupRemote();
    // this.socketConnection.onreconnected(() => {
    //   this.log("reconnect successful");
    //   this.socketReconnected();
    // });
    // this.socketConnection.onreconnecting(() => {
    //   this.log("connection error - trying automatic reconnect");
    //   this.connected = false;
    // });
    try {
      // await this.socketConnection.start();
      await this.connectionSuccessfullyEstablished();
    } catch (error) {
      this.logError(
        `Socket connection setup failed with error:${error} - retrying`
      );
      await this.initialConnect();
    }
  }

  private async setupRemote() {
    try {
      // const response = await this.axios.get(
      //   this.config.connectionUrl + "/connections"
      // );
      // if (!response.data.includes(this.config.connectionPort)) {
      //   this.logError(
      //     `Port:${this.config.connectionPort} is not available. Available Ports:${response.data}`
      //   );
      //   this.logError("Stopping camera.");
      //   this.dispose();
      // }
    } catch (error) {
      this.log(`Failed to connect - ${error}`);
      await this.setupRemote();
      return;
    }
    const connection = {
      connectionName: this.config.connectionPort,
      connected: true,
    };
    console.log("connection", connection);
    try {
      console.log("connectionUrl", this.config.connectionUrl);
      // await this.axios
      //   .put(`${this.config.connectionUrl}/connection`, connection)
      //   .then(() => {
      //     console.log("connection put");
      //   });
    } catch (error) {
      console.log("error", error);
      this.logError(
        `Failed to connect to Port:${this.config.connectionPort} with error:${error}`
      );
      this.logError("Stopping camera.");
      this.dispose();
    }

    console.log("setupRemote");
  }

  private async connectionSuccessfullyEstablished() {
    console.log("connectionSuccessfullyEstablished");
    this.canTransmit = true;
    this.connected = true;
    await this.transmitNextStateIfRequestedAndPossible();
  }

  private async transmitNextStateIfRequestedAndPossible() {
    if (!this.canTransmit) return;
    if (!this.websocket) return;
    if (!this.shouldTransmitState) return;

    this.canTransmit = false;
    this.shouldTransmitState = false;
    try {
      this.websocket?.send(JSON.stringify(this.currentState));
      // const updateSuccessful = await this.socketConnection.invoke(
      //   "SetState",
      //   this.currentState
      // );
      // console.log("updateSuccessful", this.currentState);
      // if (!updateSuccessful) {
      //   this.log("state update failure returned - retrying");
      //   this.shouldTransmitState = true;
      // }
      this.canTransmit = true;
    } catch (error) {
      this.shouldTransmitState = true;
      this.log(`state transmission error - ${error}`);
      await this.transmitNextStateIfRequestedAndPossible();
    }
  }

  private scheduleStateTransmission() {
    this.shouldTransmitState = true;
    this.transmitNextStateIfRequestedAndPossible();
  }

  private log(toLog: string) {
    this.logger.log(`CgfPtzCamera(${this.config.connectionUrl}):${toLog}`);
  }

  private logError(toLog: string) {
    this.logger.error(`CgfPtzCamera(${this.config.connectionUrl}):${toLog}`);
  }
  private multiplyRoundAndCrop(value: number, maximumAbsolute: number): number {
    const maximized = Math.max(
      -maximumAbsolute,
      Math.min(maximumAbsolute, value)
    );
    return Math.round(maximized);
  }
}
