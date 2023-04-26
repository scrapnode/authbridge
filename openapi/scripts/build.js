require("dotenv").config();
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const { compile } = require("handlebars");

const template = require(path.resolve(__dirname, "../src/configs.json"));

main().then(() => setTimeout(process.exit, 1000));

async function main() {
  return Promise.all([buildIndexHtml(), buildOpenAPIJSON()]);
}

async function buildIndexHtml() {
  const inputPath = path.resolve(__dirname, "../src/index.html");
  const input = await fs.promises.readFile(inputPath, "utf8");
  const render = compile(input);

  const output = render(template);
  const outputPath = path.resolve(__dirname, "../build/index.html");
  return fs.promises.writeFile(outputPath, output, "utf-8");
}

async function buildOpenAPIJSON() {
  const inputPath = path.resolve(__dirname, "../src/openapi.yaml");
  const input = await fs.promises.readFile(inputPath, "utf8");
  const render = compile(input);

  const output = yaml.load(render(template));
  const outputPath = path.resolve(__dirname, "../build/openapi.json");
  return fs.promises.writeFile(
    outputPath,
    JSON.stringify(output, null, 2),
    "utf-8"
  );
}
