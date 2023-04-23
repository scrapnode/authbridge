require("dotenv").config();

const fs = require("fs");
const path = require("path");
const minBy = require("lodash.minby");

const inputPath = path.resolve(__dirname, "../.template.json");
const input = require(inputPath);

const maps = Object.values(input)
  .map((c) => c.domain)
  .filter(Boolean)
  .reduce((m, domain) => {
    if (!domain.zone || !domain.zone.id) return m;
    if (!Array.isArray(domain.aliases) || domain.aliases.length == 0) return m;
    domain.aliases.forEach((alias) => {
      m[`${domain.zone.id}/${alias}`] = { zone: domain.zone.id, alias };
    });
    return m;
  }, {});

const records = Object.values(maps);
if (records.length == 0) {
  console.log(`WARN: no domain was found in .template.json`);
  return;
}

const output = {
  AWSTemplateFormatVersion: "2010-09-09",
  Resources: {
    Certificate: {
      Type: "AWS::CertificateManager::Certificate",
      Properties: {
        DomainName: minBy(records, "alias.length").alias,
        SubjectAlternativeNames: records.map(({ alias }) => alias),
        DomainValidationOptions: records.map(({ zone, alias }) => ({
          DomainName: alias,
          HostedZoneId: zone,
        })),
        ValidationMethod: "DNS",
      },
    },
  },
  Outputs: {
    CertificateArn: {
      Value: { Ref: "Certificate" },
    },
  },
};

const outputpath = path.resolve(__dirname, "../.resources.json");
fs.writeFileSync(outputpath, JSON.stringify(output, null, 2), "utf-8");
