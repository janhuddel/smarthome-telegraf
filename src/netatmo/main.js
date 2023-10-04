import { config } from "./config.js";
import { netatmoApiClient } from "./netatmo-api.js";

async function main() {
  const client = netatmoApiClient({
    access_token: config.netatmo.accessToken,
    refresh_token: config.netatmo.refreshToken,
    client_id: "650ca860f45a17698803a2b0",
    client_secret: "xhicDBB6ElueNB2HLikQfqkpFpqnhxu",
  });

  try {
    await client.authenticate();
  } catch (err) {
    console.error(err);
  }
}

main();
