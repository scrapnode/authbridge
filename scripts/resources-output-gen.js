require("dotenv").config();
const path = require("path");
const fs = require("fs");
const {
  CloudFormationClient,
  DescribeStacksCommand,
} = require("@aws-sdk/client-cloudformation");
const get = require("lodash.get");
const set = require("lodash.set");

const template = require(path.resolve(__dirname, "../.template.json"));
// # Certificate for CloudFront Distribution must be at us-east-1
const client = new CloudFormationClient({ region: "us-east-1" });

main().then(() => setTimeout(process.exit, 1000));

async function main() {
  const name = `${template.project.id}-resources-${template.project.stage}`;
  const stacks = await client.send(
    new DescribeStacksCommand({ StackName: name })
  );

  const stack = stacks.Stacks.find((stack) => stack.StackName === name);
  if (!stack) throw new Error(`stack ${name} does not exist`);

  const arn = stack.Outputs.find(
    (o) => o.OutputKey === "CertificateArn"
  ).OutputValue;
  if (!arn) throw new Error(`could not find ARN of our certificate`);

  const output = {};
  ["backend", "frontend", "openapi"].forEach((section) => {
    if (get(template, `${section}.domain.zone.id`)) {
      set(output, `${section}.domain.acm.arn`, arn);
    }
  });

  const outputPath = path.resolve(__dirname, "../.resources.output.json");
  await fs.promises.writeFile(
    outputPath,
    JSON.stringify(output, null, 2),
    "utf-8"
  );
}
