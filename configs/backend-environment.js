require("dotenv").config();
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const map = require("./template-map");
const backend = require("./backend");

module.exports = main;
// when we call this file directly, execute main function
if (process.argv[1] === __filename) main();

function main() {
  map();
  backend();

  const backendfile = path.resolve(__dirname, "../backend/configs.json");
  const configs = require(backendfile);
  const mapfile = path.resolve(__dirname, "./template-map.json");
  const { envs } = require(mapfile);

  const environments = {};
  for (const env in envs) {
    const prop = envs[env];

    if (!prop.startsWith("project") && !prop.startsWith("backend")) continue;

    // ignore AWS_ env because they are reserved key
    if (prop.startsWith("aws")) continue;

    // but some properties like AWS_ACCOUNT_ID are not reserved, so it's safe to use them
    environments[env] = _.get(configs, prop);
  }

  // those refs will be resolved by serverless template
  // then it will be set as environment
  // later, in lambda function on aws we can use it
  if (!environments.AWS_ACCOUNT_ID) {
    environments.AWS_ACCOUNT_ID = { Ref: "AWS::AccountId" };
  }
  if (!environments.BACKEND_COGNITO_POOL_ID) {
    environments.BACKEND_COGNITO_POOL_ID = { Ref: "UserPool" };
  }
  if (!environments.BACKEND_COGNITO_CLIENT_ID) {
    environments.BACKEND_COGNITO_CLIENT_ID = { Ref: "UserPoolClient" };
  }

  const envfile = path.resolve(__dirname, "../backend/environments.json");
  fs.writeFileSync(envfile, JSON.stringify(environments, null, 2));
}
