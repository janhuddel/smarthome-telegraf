export const config = {
  mqtt: {
    broker: "172.20.10.4",
    connectOptions: {
      clientId: `homematic-telegraf-${new Date().getTime()}`,
      connectTimeout: 10 * 1000,
    },
    qos: 0,
  },
  common: {
    vendor: "homematic",
  },
  devices: [
    {
      id: "0001D569A57FCA:6",
      friendly: "Server",
    },
  ],
};
