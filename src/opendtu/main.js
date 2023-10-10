import { config } from "./config.js";
import { openWebSocket } from "./ws-controller.js";
import { lineProtocol } from "../common/utils.js";

openWebSocket(config.ws.url, (message) => {
  try {
    const payload = JSON.parse(message);
    const timestamp = new Date();
    payload.inverters.forEach((inverter) => {
      // inverter
      console.log(
        lineProtocol(
          config.common.measurement,
          {
            vendor: config.common.vendor,
            friendly: inverter.name,
            device: inverter.serial,
          },
          {
            power: inverter.AC["0"].Power.v,
            voltage: inverter.AC["0"].Voltage.v,
            current: getCurrentInmA(inverter.AC["0"].Current),
            sum_power_total: getPowerInWh(inverter.AC["0"].YieldTotal),
            sum_power_today: getPowerInWh(inverter.AC["0"].YieldDay),
          },
          timestamp
        )
      );

      // panels
      for (const [key, dc] of Object.entries(inverter.DC)) {
        const device = `${inverter.serial}.${Number(key) + 1}`;
        const friendly = `Panel#${Number(key) + 1}`;
        console.log(
          lineProtocol(
            config.common.measurement,
            {
              vendor: config.common.vendor,
              friendly,
              device,
            },
            {
              power: dc.Power.v,
              voltage: dc.Voltage.v,
              current: getCurrentInmA(dc.Current),
              sum_power_total: getPowerInWh(dc.YieldTotal),
              sum_power_today: getPowerInWh(dc.YieldDay),
            },
            timestamp
          )
        );
      }
    });
  } catch (err) {
    console.error(`error processing message: ${err.message}`);
  }
});

function getPowerInWh(obj) {
  if (obj.u === "kWh") {
    return obj.v * 1000.0;
  } else {
    return obj.v;
  }
}

function getCurrentInmA(obj) {
  if (obj.u === "A") {
    return obj.v * 1000.0;
  } else {
    return obj.v;
  }
}
