require("dotenv").config();
const path = require("path");
const fs = require("fs");
const { compile } = require("handlebars");

const template = require(path.resolve(__dirname, "../src/configs.json"));

main().then(() => setTimeout(process.exit, 1000));

async function main() {
  return Promise.all([buildIndexHtml(), buildManifestJSON()]);
}

async function buildIndexHtml() {
  const inputPath = path.resolve(__dirname, "../build/index.html");
  const input = await fs.promises.readFile(inputPath, "utf8");
  const render = compile(input);

  const output = render(template);
  const outputPath = path.resolve(__dirname, "../build/index.html");
  return fs.promises.writeFile(outputPath, output, "utf-8");
}

async function buildManifestJSON() {
  const inputPath = path.resolve(__dirname, "../build/manifest.json");
  const input = await fs.promises.readFile(inputPath, "utf8");
  const render = compile(input);

  const output = render(template);
  const outputPath = path.resolve(__dirname, "../build/manifest.json");
  return fs.promises.writeFile(outputPath, output, "utf-8");
}
