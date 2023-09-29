export const config = {
  mqtt: {
    //broker: "mqtt.intra.rohwer.sh",
    broker: "172.20.10.4",
    connectOptions: {
      clientId: `tasmota-telegraf-${new Date().getTime()}`,
      connectTimeout: 10 * 1000,
    },
    qos: 0,
  },
  common: {
    vendor: "tasmota",
    measurement: "electricity",
  },
  devices: [
    {
      id: "tasmota_17E7AE",
      ip: "172.19.10.1",
      channels: ["Geschirrspüler"],
    },
    {
      id: "tasmota_186EBD",
      ip: "172.19.10.2",
      channels: ["Kühlschrank"],
    },
    {
      id: "tasmota_180E0E",
      ip: "172.19.10.3",
      channels: ["Wäschetrockner"],
    },
    {
      id: "tasmota_17BD5F",
      ip: "172.19.10.4",
      channels: ["Schreibtisch"],
    },
    {
      id: "tasmota_6886BC",
      ip: "172.19.20.1",
      channels: ["Filteranlage", "Wärmepumpe"],
    },
    {
      id: "tasmota_1CFCDC",
      ip: "172.19.20.2",
      channels: ["Balkonkraftwerk"],
    },
  ],
};
