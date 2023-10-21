import { startConnection } from "./ws-client";

const AMOUNT_OF_CAMERAS = 8;

for (let i = 0; i < AMOUNT_OF_CAMERAS; i++) {
  startConnection(i + 1);
}
