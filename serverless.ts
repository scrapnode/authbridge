require("dotenv").config();
import fs from "fs";
import path from "path";
import type { AWS } from "@serverless/typescript";
import startCase from "lodash/startCase";
import { array, object, string, bool, number } from "yup";

import configs from "@configs/index";
import { environments } from "@configs/environments";
import * as functions from "@functions/index";

const serverlessConfiguration: AWS = {
  service: "authbridge",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    region: configs.project.region as any,
    tags: {
      project: configs.project.name,
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: "cognito-idp:*",
            Resource: {
              "Fn::Join": [
                "",
                [
                  "arn:aws:cognito-idp:",
                  configs.project.region,
                  ":",
                  { Ref: "AWS::AccountId" },
                  ":userpool/",
                  { Ref: "UserPool" },
                ],
              ],
            },
          },
        ],
      },
    },
    runtime: "nodejs16.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      ...environments,
    },
    logRetentionInDays: 7,
    timeout: 25,
    httpApi: {
      cors: true,
      authorizers: {
        cognito: {
          type: "jwt",
          name: "cognito",
          identitySource: "$request.header.Authorization",
          issuerUrl: {
            "Fn::Join": [
              "",
              [
                "https://cognito-idp.",
                configs.project.region,
                ".amazonaws.com/",
                { Ref: "UserPool" },
              ],
            ],
          },
          audience: [{ Ref: "UserPoolClient" }],
        },
      },
    },
  },
  // import the function via paths
  functions,
  package: {
    individually: true,
    include: ["templates/*.mustache"],
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node16",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      UserPool: {
        Type: "AWS::Cognito::UserPool",
        Properties: {
          UserPoolName: configs.cognito.pool.name,
          UsernameAttributes: ["email"],
          AutoVerifiedAttributes: ["email"],
          Policies: {
            PasswordPolicy: {
              MinimumLength: 6,
              RequireLowercase: false,
              RequireNumbers: false,
              RequireSymbols: false,
              RequireUppercase: false,
            },
          },
          VerificationMessageTemplate: {
            DefaultEmailOption: "CONFIRM_WITH_LINK",
            EmailSubject: `${startCase(
              configs.project.name
            )} Account Confirmation`,
            EmailMessage: "Your confirmation code is {####}",
            EmailSubjectByLink: `${startCase(
              configs.project.name
            )} Account Confirmation`,
            EmailMessageByLink: "Your confirmation link is {##Click Here##}",
          },
          Schema: getUserPoolSchema(),
        },
      },
      UserPoolDomain: {
        Type: "AWS::Cognito::UserPoolDomain",
        DependsOn: ["UserPool"],
        Properties: {
          UserPoolId: { Ref: "UserPool" },
          Domain: configs.cognito.domain.name,
        },
      },
      UserPoolClient: {
        Type: "AWS::Cognito::UserPoolClient",
        DependsOn: ["UserPool"],
        Properties: {
          ClientName: configs.cognito.client.name,
          UserPoolId: { Ref: "UserPool" },
          GenerateSecret: false,
          AccessTokenValidity: 24,
          ExplicitAuthFlows: [
            "ALLOW_USER_PASSWORD_AUTH",
            "ALLOW_REFRESH_TOKEN_AUTH",
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;

function getUserPoolSchema() {
  const validator = array().of(
    object().shape({
      Name: string().required(),
      AttributeDataType: string()
        .required()
        .oneOf(["Boolean", "DateTime", "Number", "String"]),
      DeveloperOnlyAttribute: bool(),
      Mutable: bool(),
      Required: bool(),
      NumberAttributeConstraints: object().shape({
        MinValue: number(),
        MaxValue: number(),
      }),
      StringAttributeConstraints: object().shape({
        MinLength: number(),
        MaxLength: number(),
      }),
    })
  );
  const data = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "./data/user-schema.json"), "utf8")
  );
  return validator.validateSync(data);
}
