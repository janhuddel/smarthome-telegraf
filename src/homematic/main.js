import { connectAsync } from "mqtt";
import { Etcd3 } from "etcd3";
import { config } from "./config.js";
import {
  lineProtocol,
  buildOffsetKey,
  buildLastValueKey,
} from "../common/utils.js";

async function main() {
  const etcdClient = new Etcd3({ hosts: config.etcd.host });

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

  async function getOffsetAndLastValue(deviceId) {
    const offsetKey = buildOffsetKey(device.id);
    let offset = await etcdClient.get(offsetKey);
    if (offset === null) {
      await etcdClient.put(buildOffsetKey(deviceId)).value(0);
      await etcdClient.put(buildLastValueKey(deviceId)).value(0);

      offset = 0;
      lastValue = 0;
    } else {
    }
    return { offset, lastValue };
  }
}

main();
