import { openWebSocket } from "./ws-controller.js";
import { loadConfig, lineProtocol, logError } from "../common/utils.js";

const SCRIPTNAME = "opendtu";

async function main() {
  const config = await loadConfig(SCRIPTNAME);

  openWebSocket(config.ws.url, (message) => {
    try {
      const payload = JSON.parse(message);
      const timestamp = new Date();
      payload.inverters.forEach((inverter) => {
        // inverter
        const ac0 = inverter.AC?.["0"];
        if (!ac0) {
          logError(SCRIPTNAME, new Error(`AC["0"] not found for inverter ${inverter.serial}`));
          return;
        }

        const inv = inverter.INV?.["0"];
        const fields = {};
        if (ac0.Power?.v !== undefined) fields.power = ac0.Power.v;
        if (ac0.Voltage?.v !== undefined) fields.voltage = ac0.Voltage.v;
        if (ac0.Current) fields.current = getCurrentInmA(ac0.Current);
        if (inv?.YieldTotal) fields.sum_power_total = getPowerInWh(inv.YieldTotal);
        if (inv?.YieldDay) fields.sum_power_today = getPowerInWh(inv.YieldDay);

        if (Object.keys(fields).length > 0) {
          console.log(
            lineProtocol(
              config.common.measurement,
              {
                vendor: config.common.vendor,
                friendly: inverter.name,
                device: inverter.serial,
              },
              fields,
              timestamp
            )
          );
        }

        // panels
        if (inverter.DC) {
          for (const [key, dc] of Object.entries(inverter.DC)) {
            const device = `${inverter.serial}.${Number(key) + 1}`;
            const friendly = `Panel#${Number(key) + 1}`;
            
            const dcFields = {};
            if (dc.Power?.v !== undefined) dcFields.power = dc.Power.v;
            if (dc.Voltage?.v !== undefined) dcFields.voltage = dc.Voltage.v;
            if (dc.Current) dcFields.current = getCurrentInmA(dc.Current);
            if (dc.YieldTotal) dcFields.sum_power_total = getPowerInWh(dc.YieldTotal);
            if (dc.YieldDay) dcFields.sum_power_today = getPowerInWh(dc.YieldDay);

            if (Object.keys(dcFields).length > 0) {
              console.log(
                lineProtocol(
                  config.common.measurement,
                  {
                    vendor: config.common.vendor,
                    friendly,
                    device,
                  },
                  dcFields,
                  timestamp
                )
              );
            }
          }
        }
      });
    } catch (err) {
      logError(SCRIPTNAME, err);
    }
  });

  function getPowerInWh(obj) {
    if (!obj || obj.v === undefined) {
      return undefined;
    }
    if (obj.u === "kWh") {
      return obj.v * 1000.0;
    } else {
      return obj.v;
    }
  }

  function getCurrentInmA(obj) {
    if (!obj || obj.v === undefined) {
      return undefined;
    }
    if (obj.u === "A") {
      return obj.v * 1000.0;
    } else {
      return obj.v;
    }
  }
}

main();
