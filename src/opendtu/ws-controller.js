import { WebSocket } from "ws";
import createLogger from "debug";

// inspired by: https://github.com/o0shojo0o/ioBroker.opendtu/blob/main/lib/websocketController.js
export const openWebSocket = (url, messageHandler) => {
  const wsHeartbeatIntervall = 10000;
  const restartTimeout = 5000;

  let ping;
  let pingTimeout;
  let autoRestartTimeout;

  let wsClient = null;

  const logger = createLogger("websocket");

  function connect() {
    logger(`connecting to websocket ${url}...`);
    wsClient = new WebSocket(url);

    wsClient.on("open", () => {
      logger("websocket connected");

      // Send ping to server
      sendPingToServer();

      // Start Heartbeat
      wsHeartbeat();
    });

    wsClient.on("pong", () => {
      logger("got pong from websocket server");
      wsHeartbeat();
    });

    wsClient.on("close", () => {
      logger("websocket closed");

      clearTimeout(pingTimeout);
      clearTimeout(ping);

      if (wsClient.readyState === WebSocket.CLOSED) {
        autoRestart();
      }
    });

    wsClient.on("error", (err) => {
      console.error(`Websocket ${err.name}: ${err.message}`);
    });

    wsClient.on("message", messageHandler);
  }

  function sendPingToServer() {
    logger("sending ping to server");

    wsClient.ping();
    ping = setTimeout(() => {
      sendPingToServer();
    }, wsHeartbeatIntervall);
  }

  function wsHeartbeat() {
    clearTimeout(pingTimeout);
    pingTimeout = setTimeout(() => {
      console.error("Websocked timed out");
      wsClient.terminate();
    }, wsHeartbeatIntervall + 3000);
  }

  function autoRestart() {
    logger(`auto-retry in ${restartTimeout / 1000} seconds...`);

    clearTimeout(autoRestartTimeout);
    autoRestartTimeout = setTimeout(() => connect(), restartTimeout);
  }

  connect();
};
