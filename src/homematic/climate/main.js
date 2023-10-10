import { connectAsync } from "mqtt";
import { config } from "./config.js";
import { lineProtocol } from "../../common/utils.js";

async function main() {
  const mqttClient = await connectAsync(
    `mqtt://${config.mqtt.broker}`,
    config.mqtt.connectOptions
  );

  const topics = config.devices.map(
    (d) => `${config.mqtt.topicPrefix}/${d.id}/+`
  );

  console.log(topics);

  await mqttClient.subscribeAsync(topics, {
    qos: config.mqtt.qos,
  });

  mqttClient.on("message", async (topic, message) => {
    try {
      const topicParts = topic.split("/");
      const deviceId = topicParts[2];
      const device = config.devices.find((d) => d.id === deviceId);
      const field = config.common.fieldsOfInterest[topicParts[3]];

      if (device && field) {
        const sensorData = JSON.parse(message);
        let value = sensorData.val;

        const hmip = sensorData.hm.iface.startsWith("HmIP");
        if (hmip && topicParts[3] === "LEVEL") {
          value *= 100;
        } else if (hmip && topicParts[3] === "VALVE_STATE") {
          return;
        }

        if (field === "valve_level") {
          value = Math.round(value * 100) / 100;
        }

        const fields = {};
        fields[field] = value;

        console.log(
          lineProtocol(
            config.common.measurement,
            {
              vendor: config.common.vendor,
              friendly: device.friendly,
              device: sensorData.hm.device,
              type: sensorData.hm.iface,
            },
            fields,
            new Date(sensorData.ts)
          )
        );
      }
    } catch (err) {
      console.error(err.message);
    }
  });
}

main();
