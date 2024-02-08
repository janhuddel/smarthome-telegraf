import { connectAsync } from "mqtt";
import { loadConfig, lineProtocol, logError } from "../../common/utils.js";

const SCRIPTNAME = "homematic-climate";

async function main() {
  const config = await loadConfig(SCRIPTNAME);

  const mqttClient = await connectAsync(
    `mqtt://${config.mqtt.broker}`,
    config.mqtt.connectOptions
  );

  const topics = config.devices.map(
    (d) => `${config.mqtt.topicPrefix}/${d.id}/+`
  );

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
      logError(SCRIPTNAME, err);
    }
  });
}

main();
