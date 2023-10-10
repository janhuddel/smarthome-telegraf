import { CronJob } from "cron";
import { netatmoApiClient } from "./netatmo-api.js";
import { loadConfig, lineProtocol } from "../common/utils.js";

async function main() {
  const config = await loadConfig("netatmo");
  const client = netatmoApiClient(config);

  // start cronjob
  new CronJob(
    config.common.cron,
    collectMetrics,
    null, // onComplete
    true, // auto-start
    "Europe/Berlin", // timezone
    null, // context
    true // runOnOnit
  );

  async function collectMetrics() {
    try {
      const data = await client.getStationsData();

      const mainDevice = data.body.devices[0];
      processModule(mainDevice);
      mainDevice.modules.forEach(processModule);
    } catch (err) {
      console.error(err);
    }
  }

  async function processModule(module) {
    const device = config.devices.find((d) => d.id === module._id);
    if (device) {
      const timestamp = module.dashboard_data.time_utc * 1000000000;

      const fields = {};
      if (module.dashboard_data.Temperature) {
        fields["temperature"] = module.dashboard_data.Temperature;
      }
      if (module.dashboard_data.CO2) {
        fields["co2"] = module.dashboard_data.CO2;
      }
      if (module.dashboard_data.Humidity) {
        fields["humidity"] = module.dashboard_data.Humidity;
      }
      if (module.dashboard_data.Noise) {
        fields["noise"] = module.dashboard_data.Noise;
      }
      if (module.dashboard_data.Pressure) {
        fields["pressure"] = module.dashboard_data.Pressure;
      }

      console.log(
        lineProtocol(
          config.common.measurement,
          {
            vendor: config.common.vendor,
            device: module._id,
            friendly: device.friendly,
          },
          fields,
          timestamp
        )
      );
    }
  }
}

main();
