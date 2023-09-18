import winston from "winston";
import { ILogger } from "cgf.cameracontrol.main.core";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;

class Logger implements ILogger {
  log(toLog: string): void {
    console.log(toLog);
  }
  error(toLog: string): void {
    console.error(toLog);
  }
  debug(toLog: string): void {
    console.log(toLog);
  }
}
const legacyLogger = new Logger();

export { legacyLogger };
