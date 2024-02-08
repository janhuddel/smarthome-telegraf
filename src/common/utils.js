const ENV = process.env["ENV"] || "dev";

function round(num) {
  return Math.round(num * 100) / 100;
}

export function logError(scriptname, err) {
  let errMessage = `[${scriptname}] `;
  if (err.name) {
    errMessage += `${err.name}: `;
  }
  
  if (err.message) {
    errMessage += `${err.message}`
  } else {
    errMessage += `${JSON.stringify(err)}`
  }

  console.error(errMessage);
}

export async function loadConfig(name) {
  const configFile = `../../config/${ENV}/${name}.js`;
  //console.error(`loading configuration ${configFile}...`);
  const configModule = await import(configFile);
  return configModule.config;
}

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
          return `${key}=${round(value)}`;
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
