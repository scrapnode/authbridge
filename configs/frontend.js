require("dotenv").config();
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const map = require("./template-map");

module.exports = main;
// when we call this file directly, execute main function
if (process.argv[1] === __filename) main();

function main(templatefile = "./template.json") {
  map();

  const template = require(templatefile);
  const configs = {};

  const mapfile = path.resolve(__dirname, "./template-map.json");
  const { props } = require(mapfile);
  for (const prop in props) {
    if (!prop.startsWith("project") && !prop.startsWith("frontend")) continue;

    let value = _.get(template, prop);

    const env = props[prop];
    if (process.env[env]) value = process.env[env];

    console.log(prop, "--->", value);
    _.set(configs, prop, value);
  }

  const frontendfile = path.resolve(__dirname, "../frontend/src/configs.json");
  fs.writeFileSync(frontendfile, JSON.stringify(configs, null, 2));
}
