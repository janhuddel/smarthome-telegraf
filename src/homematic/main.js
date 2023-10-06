import { connectAsync } from "mqtt";
import { Etcd3 } from "etcd3";
import { config } from "./config.js";
import {
  lineProtocol,
  buildOffsetKey,
  buildLastValueKey,
} from "../common/utils.js";

async function main() {
  const etcdClient = new Etcd3({
    hosts: config.etcd.host,
  });

  const mqttClient = await connectAsync(
    `mqtt://${config.mqtt.broker}`,
    config.mqtt.connectOptions
  );

  const topics = config.devices.map((d) => `hm2/status/${d.id}/+`);
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
        const fields = {};
        let value = sensorData.val;

        if (config.common.useOffsets && field === "sum_power_total") {
          // the plug of Homematic IP starts again from 0 after a voltage loss
          let { offset, lastValue } = await getOffsetAndLastValue(deviceId);
          const value_raw = value;

          if (value < lastValue) {
            // reset -> lastValue + old offset = new offset
            offset += lastValue;

            // save new offset
            await etcdClient.put(buildOffsetKey(deviceId)).value(offset);
          }

          value += offset;

          // save last value
          await etcdClient.put(buildLastValueKey(deviceId)).value(value_raw);

          fields["sum_power_total_raw"] = value_raw;
          fields["offset"] = offset;
        }

        fields[field] = value;
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
    } catch (err) {
      console.error(err.message);
    }
  });

  async function getOffsetAndLastValue(deviceId) {
    const offsetKey = buildOffsetKey(deviceId);
    const lastValueKey = buildLastValueKey(deviceId);

    let offset = await etcdClient.get(offsetKey);
    let lastValue = 0;
    if (offset === null) {
      // first run
      await etcdClient.put(offsetKey).value(0);
      await etcdClient.put(lastValueKey).value(0);

      offset = 0;
      lastValue = 0;
    } else {
      lastValue = await etcdClient.get(lastValueKey);
    }
    return { offset: Number(offset), lastValue: Number(lastValue) };
  }
}

main();
