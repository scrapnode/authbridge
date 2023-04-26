require("dotenv").config();
const path = require("path");
const fs = require("fs");
const {
  CloudFormationClient,
  DescribeStacksCommand,
} = require("@aws-sdk/client-cloudformation");

const template = require(path.resolve(__dirname, "../src/configs.json"));
const client = new CloudFormationClient({ region: template.aws.region });

main().then(() => setTimeout(process.exit, 1000));

async function main() {
  const name = `${template.project.id}-backend-${template.project.stage}`;
  const stacks = await client.send(
    new DescribeStacksCommand({ StackName: name })
  );

  const stack = stacks.Stacks.find((stack) => stack.StackName === name);
  if (!stack) throw new Error(`stack ${name} does not exist`);

  const output = {
    backend: {
      endpoint: stack.Outputs.find((o) => o.OutputKey === "HttpApiUrl")
        .OutputValue,
    },
  };

  const hasDomain =
    template.backend.domain?.acm?.arn &&
    template.backend.domain?.zone?.id &&
    Array.isArray(template.backend.domain?.aliases) &&
    template.backend.domain.aliases.length > 0;
  if (hasDomain) {
    output.backend.endpoint = `https://${template.backend.domain.aliases[0]}`;
  }

  const outputPath = path.resolve(__dirname, "../.output.json");
  await fs.promises.writeFile(
    outputPath,
    JSON.stringify(output, null, 2),
    "utf-8"
  );
}
