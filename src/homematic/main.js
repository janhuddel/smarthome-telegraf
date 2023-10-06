import { connectAsync } from "mqtt";
import { config } from "./config.js";
import { lineProtocol } from "../common/utils.js";

async function main() {
  const mqttClient = await connectAsync(
    `mqtt://${config.mqtt.broker}`,
    config.mqtt.connectOptions
  );

  const topics = config.devices.map((d) => `hm2/status/${d.id}/+`);

  await mqttClient.subscribeAsync(topics, { qos: config.mqtt.qos });

  mqttClient.on("message", async (topic, message) => {
    const topicParts = topic.split("/");
    const deviceId = topicParts[2];
    const device = config.devices.find((d) => d.id === deviceId);
    const field = config.common.fieldsOfInterest[topicParts[3]];

    if (device && field) {
      const sensorData = JSON.parse(message);
      const fields = {};
      fields[field] = sensorData.val;

      console.log(
        lineProtocol(
          config.common.measurement,
          {
            vendor: config.common.vendor,
            friendly: device.friendly,
            device: sensorData.hm.device,
          },
          fields,
          new Date(sensorData.ts)
        )
      );
    }
  });
}

main();
