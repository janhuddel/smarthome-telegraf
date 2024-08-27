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
    if (sensorData.MT175) {
      // SmartMeter (Hichi, IR Lesekopf)
      return processSmartMeter(device, sensorData);
    }

    if (Array.isArray(sensorData.ENERGY.Power)) {
      // SONOFF DUAL R3 (2 Kanäle)
      return processMultiChannel(device, sensorData);
    }

    // normaler Zwischenstecker mit einem Kanal
    return processSingleChannel(device, sensorData);
  }

  async function processSmartMeter(device, sensorData) {
    const time = new Date(sensorData.Time);
    const power = sensorData.MT175.P;

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
          power_l1: sensorData.MT175.L1,
          power_l2: sensorData.MT175.L2,
          power_l3: sensorData.MT175.L3,
          sum_power_total: sensorData.MT175.E_in * 1000.0,
          sum_power_total_out: sensorData.MT175.E_out * 1000.0,
        },
        time
      )
    );
  }

  async function processSingleChannel(device, sensorData) {
    const time = new Date(sensorData.Time);
    const power = sensorData.ENERGY.Power;

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
  }

  async function processMultiChannel(device, sensorData) {
    const time = new Date(sensorData.Time);
    const power = sensorData.ENERGY.Power;

    // Multi-Channel (die Totals müssen per Http nachgelesen werden, da sie nicht in den Sensordaten enthalten sind)
    const response = await axios.get(`http://${device.ip}/cm?cmnd=EnergyTotal`);
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

main();
