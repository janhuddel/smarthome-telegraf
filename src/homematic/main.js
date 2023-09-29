import axios from "axios";

import { connectAsync } from "mqtt";
import { config } from "./config.js";
import { lineProtocol } from "../common/utils.js";

async function main() {
  const mqttClient = await connectAsync(
    `mqtt://${config.mqtt.broker}`,
    config.mqtt.connectOptions
  );

  const topics = config.devices.map((d) => `hm2/status/${d.id}/+`);
  console.log(topics);

  await mqttClient.subscribeAsync(topics, { qos: config.mqtt.qos });

  mqttClient.on("message", async (topic, message) => {
    const topicParts = topic.split("/");
    const deviceId = topicParts[2];
    const device = config.devices.find((d) => d.id === deviceId);

    if (device) {
      const sensorData = JSON.parse(message);

      console.log(
        `sensor data for ${device.friendly} received: ${topicParts[3]} : ${sensorData.val}`
      );
    }
  });
}

main();
