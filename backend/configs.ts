import _ from "lodash";
import cfg from "./configs.json";
import maps from "./configs.map.json";

const configs = { ...cfg };

for (const prop in maps) {
  let value = _.get(cfg, prop);

  const env = maps[prop];
  if (process.env[env]) value = process.env[env];
  _.set(configs, prop, value);
}

export default configs;
