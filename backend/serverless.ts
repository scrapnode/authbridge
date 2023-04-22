require("dotenv").config();
import type { AWS } from "@serverless/typescript";

import configs from "@configs";
import functions from "@functions/index";
import attributes from "@custom/cognito/attributes.json";

const serverlessConfiguration: AWS = {
  service: configs.project.id,
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    stage: process.env.SLS_STAGE || "dev",
    region: configs.aws.region as any,
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
                  { Ref: "AWS::Region" },
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
      BACKEND_COGNITO_POOL_ID: { Ref: "UserPool" },
      BACKEND_COGNITO_CLIENT_ID: { Ref: "UserPoolClient" },
    },
    logRetentionInDays: 30,
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
                { Ref: "AWS::Region" },
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
          UserPoolName: configs.backend.cognito.pool.name,
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
      UserPoolClient: {
        Type: "AWS::Cognito::UserPoolClient",
        DependsOn: ["UserPool"],
        Properties: {
          ClientName: configs.backend.cognito.client.name,
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
