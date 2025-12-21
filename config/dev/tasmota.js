export const config = {
  mqtt: {
    broker: "172.22.2.40",
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
      id: "tasmota_FD1DE4",
      ip: "172.19.10.201",
      channels: ["SmartMeter"],
    },
  ],
};
