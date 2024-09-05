export const config = {
  mqtt: {
    broker: "mqtt",
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
      id: "tasmota_BE7440",
      ip: "172.19.10.5",
      channels: ["Büro#1"],
    },
    {
      id: "tasmota_92E8B4",
      ip: "172.19.10.6",
      channels: ["Büro#2"],
    },
    {
      id: "tasmota_BE97A0",
      ip: "172.19.10.7",
      channels: ["Büro#3"],
    },
    {
      id: "tasmota_6886BC",
      ip: "172.19.20.1",
      channels: ["Filteranlage", "Wärmepumpe"],
    },
    {
      id: "tasmota_1CFCDC",
      ip: "172.19.20.2",
      channels: ["Wechselrichter"],
    },
    {
      id: "tasmota_FD1DE4",
      ip: "172.19.10.201",
      channels: ["SmartMeter"],
    },
  ],
};
