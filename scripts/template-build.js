require("dotenv").config();

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const inputPath = path.resolve(__dirname, "../template.yaml");
const input = fs.readFileSync(inputPath, { encoding: "utf-8" });

const output = yaml.load(input);
setByEnv(output);

const outputpath = path.resolve(__dirname, "../template.json");
fs.writeFileSync(outputpath, JSON.stringify(output, null, 2), "utf-8");

function setByEnv(output, envPrefix, propPrefix) {
  for (let key in output) {
    const ENV_KEY = key.toUpperCase();

    const ENV = [envPrefix, ENV_KEY].filter(Boolean).join("_");
    const prop = [propPrefix, key].filter(Boolean).join(".");

    if (output[key] && typeof output[key] === "object") {
      setByEnv(output[key], ENV, prop); // it's a nested object, so do it again
    } else {
      // it's not an object, so set the property
      const env = process.env[ENV];
      console.log(`${prop} -> ${ENV} -> ${env}`);
      if (env) {
        switch (typeof output[key]) {
          case "number":
            output[key] = Number(env);
          case "boolean":
            output[key] = env.toLowerCase() === "true";
            break;
          default:
            output[key] = String(env);
        }
      }
    }
  }
}
