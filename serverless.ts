require("dotenv").config();
import type { AWS } from "@serverless/typescript";

import configs from "@configs/index";
import { environments } from "@configs/environments";
import functions from "@functions/index";
import attributes from "./data/cognito_attributes.json";

const serverlessConfiguration: AWS = {
  service: configs.project.name.toLowerCase(),
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
    patterns: ["templates/*.hbs", "data/*.json"],
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
            EmailSubject: `${configs.project.name} Account Confirmation`,
            EmailMessage: "Your confirmation code is {####}",
            EmailSubjectByLink: `${configs.project.name} Account Confirmation`,
            EmailMessageByLink: "Your confirmation link is {##Click Here##}",
          },
          Schema: attributes,
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
