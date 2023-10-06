import { hostname } from "os";

export const buildOffsetKey = (device) => `/telegraf/${device}/offset`;

export const buildLastValueKey = (device) => `/telegraf/${device}/last`;

export function lineProtocol(measurement, tags, fields, timestamp) {
  let line = `${measurement}`;

  // Tags
  if (tags) {
    line +=
      "," +
      Object.entries(tags)
        .map(([key, value]) => `${key}=${value}`)
        .join(",");
  }

  // Fields
  line +=
    " " +
    Object.entries(fields)
      .map(([key, value]) => {
        if (typeof value === "string" || value instanceof String) {
          return `${key}="${value}"`;
        } else {
          return `${key}=${value}`;
        }
      })
      .join(",");

  // Timestamp
  if (timestamp instanceof Date) {
    line += ` ${timestamp.getTime() * 1000000}`;
  } else {
    line += ` ${timestamp}`;
  }

  return line;
}
