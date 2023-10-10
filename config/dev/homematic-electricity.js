export const config = {
  mqtt: {
    broker: "172.16.1.12",
    topicPrefix: "hm/status",
    connectOptions: {
      clientId: `homematic-electricity-telegraf-${new Date().getTime()}`,
      connectTimeout: 10 * 1000,
    },
    qos: 0,
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
    dbFile: "data/jsondb/telegraf-homematic.json",
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
