export const config = {
  mqtt: {
    broker: "mqtt",
    topicPrefix: "hm/status",
    connectOptions: {
      clientId: `homematic-climate-telegraf-${new Date().getTime()}`,
      connectTimeout: 10 * 1000,
    },
    qos: 0,
  },
  common: {
    vendor: "homematic",
    measurement: "climate",
    fieldsOfInterest: {
      ACTUAL_TEMPERATURE: "temperature",
      SET_TEMPERATURE: "set_temperature",
      SET_POINT_TEMPERATURE: "set_temperature",
      LEVEL: "valve_level",
      VALVE_STATE: "valve_level",
    },
  },
  devices: [
    { id: "MEQ0807382:4", friendly: "Büro" },
    { id: "MEQ0791070:4", friendly: "Schlafzimmer" },
    { id: "MEQ0792905:4", friendly: "Kinderzimmer-Levke" },
    { id: "MEQ0792997:4", friendly: "Wohnzimmer#1" },
    { id: "MEQ0793148:4", friendly: "Wohnzimmer#2" },
    { id: "002A9D89BC1CB1:1", friendly: "Bad" },
    { id: "000A1709AB7660:1", friendly: "Gäste-WC" },
    { id: "000A1D89A58BDC:1", friendly: "Wintergarten#1" },
    { id: "000A18A9AA599A:1", friendly: "Wintergarten#2" },
    { id: "00119A49960B26:1", friendly: "Kinderzimmer-Jonte#1" },
    { id: "000A18A9AA595D:1", friendly: "Kinderzimmer-Jonte#2" },
  ],
};
