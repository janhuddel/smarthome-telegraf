import { connectAsync } from "mqtt";
import { config } from "./config.js";
import { JsonDB, Config } from "node-json-db";
import { lineProtocol } from "../common/utils.js";

async function main() {
  const jsonDb = new JsonDB(new Config(config.common.dbFile, true, true, "/"));

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
            await updateOffset(deviceId, offset);
          }

          value += offset;

          // save last value
          await updateLastValue(deviceId, value_raw);

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
    const offsetKey = `/${deviceId}/offset`;
    const lastValueKey = `/${deviceId}/last`;

    let offset = await jsonDb.getObjectDefault(offsetKey, null);
    let lastValue = 0;
    if (offset === null) {
      // first run
      await updateOffset(deviceId, 0);
      await updateLastValue(deviceId, 0);

      offset = 0;
      lastValue = 0;
    } else {
      lastValue = await jsonDb.getData(lastValueKey);
    }
    return { offset: Number(offset), lastValue: Number(lastValue) };
  }

  async function updateOffset(deviceId, offset) {
    await jsonDb.push(`/${deviceId}/offset`, offset);
    await jsonDb.push(`/${deviceId}/offset_updated`, new Date());
  }

  async function updateLastValue(deviceId, lastValue) {
    await jsonDb.push(`/${deviceId}/last`, lastValue);
  }
}

main();
