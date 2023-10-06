import { hostname } from "os";

export const config = {
  mqtt: {
    broker: "172.20.10.4",
    connectOptions: {
      clientId: `homematic-telegraf-${new Date().getTime()}`,
      connectTimeout: 10 * 1000,
    },
    qos: 0,
  },
  etcd: {
    host: "172.20.10.6:2379",
  },
  common: {
    vendor: "homematic",
    measurement: "electricity",
    fieldsOfInterest: {
      POWER: "power",
      CURRENT: "current",
      VOLTAGE: "voltage",
      ENERGY_COUNTER: "sum_power_total",
    },
    useOffsets: true,
  },
  devices: [
    {
      id: "0001D569A57FCA:6",
      friendly: "Server",
    },
    {
      id: "0001DA49A34B53:6",
      friendly: "Gefrierschrank",
    },
    {
      id: "LEQ0533123:2",
      friendly: "Waschmaschine",
    },
  ],
};
