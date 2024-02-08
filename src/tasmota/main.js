import axios from "axios";
import { connectAsync } from "mqtt";
import { loadConfig, lineProtocol, logError } from "../common/utils.js";

const SCRIPTNAME = "tasmota";

async function main() {
  const config = await loadConfig(SCRIPTNAME);

  const mqttClient = await connectAsync(
    `mqtt://${config.mqtt.broker}`,
    config.mqtt.connectOptions
  );

  await mqttClient.subscribeAsync(["tele/+/SENSOR"], { qos: config.mqtt.qos });

  mqttClient.on("message", async (topic, message) => {
    const topicParts = topic.split("/");
    const deviceId = topicParts[1];
    const device = config.devices.find((d) => d.id === deviceId);

    if (device) {
      const sensorData = JSON.parse(message);
      try {
        await processSensorData(device, sensorData);
      } catch (err) {
        logError(SCRIPTNAME, err);
      }
    }
  });

  async function processSensorData(device, sensorData) {
    const power = sensorData.ENERGY.Power;
    const time = new Date(sensorData.Time);

    if (!Array.isArray(power)) {
      // Single-Channel
      console.log(
        lineProtocol(
          config.common.measurement,
          {
            vendor: config.common.vendor,
            device: device.id,
            friendly: device.channels[0],
          },
          {
            power,
            voltage: sensorData.ENERGY.Voltage,
            current: sensorData.ENERGY.Current * 1000.0,
            sum_power_today: sensorData.ENERGY.Today * 1000.0,
            sum_power_total: sensorData.ENERGY.Total * 1000.0,
          },
          time
        )
      );
    } else {
      // Multi-Channel (die Totals müssen per Http nachgelesen werden, da sie nicht in den Sensordaten enthalten sind)
      const response = await axios.get(
        `http://${device.ip}/cm?cmnd=EnergyTotal`
      );
      const energyTotals = response.data.EnergyTotal;

      for (const [i, channel] of device.channels.entries()) {
        console.log(
          lineProtocol(
            config.common.measurement,
            {
              vendor: config.common.vendor,
              device: `${device.id}.${i}`,
              friendly: channel,
            },
            {
              power: power[i],
              voltage: sensorData.ENERGY.Voltage,
              current: sensorData.ENERGY.Current[i] * 1000.0,
              sum_power_today: energyTotals.Today[i] * 1000.0,
              sum_power_total: energyTotals.Total[i] * 1000.0,
            },
            time
          )
        );
      }
    }
  }
}

main();
