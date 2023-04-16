const fs = require("fs");
const path = require("path");

module.exports = main;
// when we call this file directly, execute main function
if (process.argv[1] === __filename) main();

function main(templatefile = "./template.json") {
  const template = require(templatefile);

  const envs = {};
  walk(template, "", "", envs);

  const props = {};
  for (const env in envs) {
    props[envs[env]] = env;
  }

  const mapfile = path.resolve(__dirname, "./template-map.json");
  fs.writeFileSync(mapfile, JSON.stringify({ envs, props }, null, 2));
}

function walk(obj, env, key, res) {
  for (let prop in obj) {
    const ENV = prop.toUpperCase();

    const NEW_ENV = [env, ENV].filter(Boolean).join("_");
    const newKey = [key, prop].filter(Boolean).join(".");

    if (obj[prop] && typeof obj[prop] === "object") {
      walk(obj[prop], NEW_ENV, newKey, res); // it's a nested object, so do it again
    } else {
      res[NEW_ENV] = newKey; // it's not an object, so set the property
    }
  }
}
