export const config = {
  netatmo: {
    clientId: process.env["NETATMO_API_CLIENT_ID"],
    clientSecret: process.env["NETATMO_API_CLIENT_SECRET"],
    // create token here: https://dev.netatmo.com/apps/
  },
  common: {
    vendor: "netatmo",
    measurement: "climate",
    cron: "0 */5 * * * *",
    dbFile: "/var/lib/jsondb/telegraf-netatmo.json",
  },
  devices: [
    { id: "70:ee:50:00:ba:fc", friendly: "Wohnzimmmer" },
    { id: "02:00:00:00:bf:d8", friendly: "Garten" },
    { id: "03:00:00:03:7d:76", friendly: "Büro" },
    { id: "03:00:00:00:bf:24", friendly: "HW-Raum" },
  ],
};
