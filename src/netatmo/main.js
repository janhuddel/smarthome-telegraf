import { config } from "./config.js";
import { netatmoApiClient } from "./netatmo-api.js";

async function main() {
  const client = netatmoApiClient(config.netatmo);

  try {
    const data = await client.getStationsData();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

main();
