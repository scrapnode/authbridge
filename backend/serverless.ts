require("dotenv").config();
import type { AWS } from "@serverless/typescript";
import _ from "lodash";

import configs from "@configs";
import functions from "@functions/index";
import attributes from "@custom/cognito/attributes.json";

const deployment: AWS = {
  service: `${configs.project.id}-backend`,
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    stage: configs.project.stage || "dev",
    region: configs.aws.region as any,
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

module.exports = withCustomDomain(deployment);

function withCustomDomain(deployment: AWS): AWS {
  if (!configs.backend.domain?.acm?.arn) return deployment;

  if (!configs.backend.domain?.zone?.id) {
    console.warn(`WARN: ACM ARN is set but no Zone ID is set`);
    return deployment;
  }
  if (
    !Array.isArray(configs.backend.domain?.aliases) ||
    configs.backend.domain.aliases.length === 0
  ) {
    console.warn(`WARN: ACM ARN is set but no alias is set`);
    return deployment;
  }

  if (!deployment.resources?.Resources) {
    _.set(deployment, "resources.Resources", {});
  }

  deployment.resources.Resources.CloudFrontDistribution = {
    Type: "AWS::CloudFront::Distribution",
    DeletionPolicy: "Delete",
    Properties: {
      DistributionConfig: {
        Enabled: true,
        PriceClass: "PriceClass_100",
        HttpVersion: "http2",
        Comment: `Api distribution for ${configs.backend.domain.aliases}`,
        Origins: [
          {
            Id: "ApiGateway",
            DomainName: {
              "Fn::Join": [
                "",
                [
                  { Ref: "HttpApi" },
                  ".execute-api.",
                  { Ref: "AWS::Region" },
                  ".amazonaws.com",
                ],
              ],
            },
            OriginPath: "",
            CustomOriginConfig: {
              HTTPPort: 80,
              HTTPSPort: 443,
              OriginProtocolPolicy: "https-only",
              OriginSSLProtocols: ["TLSv1", "TLSv1.1", "TLSv1.2"],
            },
          },
        ],
        DefaultCacheBehavior: {
          TargetOriginId: "ApiGateway",
          ViewerProtocolPolicy: "redirect-to-https",
          Compress: true,
          DefaultTTL: 0,
          AllowedMethods: [
            "HEAD",
            "DELETE",
            "POST",
            "GET",
            "OPTIONS",
            "PUT",
            "PATCH",
          ],
          CachedMethods: ["HEAD", "OPTIONS", "GET"],
          ForwardedValues: {
            QueryString: false,
            Headers: ["Accept", "x-api-key", "Authorization"],
            Cookies: {
              Forward: "none",
            },
          },
        },
        Aliases: configs.backend.domain.aliases,
        ViewerCertificate: {
          SslSupportMethod: "sni-only",
          MinimumProtocolVersion: "TLSv1.2_2019",
          AcmCertificateArn: configs.backend.domain.acm.arn,
        },
      },
    },
  };

  deployment.resources.Resources.Route53RecordSetGroup = {
    Type: "AWS::Route53::RecordSetGroup",
    DeletionPolicy: "Delete",
    DependsOn: ["CloudFrontDistribution"],
    Properties: {
      HostedZoneId: configs.backend.domain.zone.id,
      RecordSets: configs.backend.domain.aliases.map((alias) => ({
        Name: alias,
        Type: "A",
        AliasTarget: {
          // with CloudFront Distribution, when you create alias resource record sets,
          // you must specify Z2FDTNDATAQYW2 for the HostedZoneId property, as shown in the following example.
          // Alias resource record sets for CloudFront can't be created in a private zone.
          HostedZoneId: "Z2FDTNDATAQYW2",
          DNSName: {
            "Fn::GetAtt": ["CloudFrontDistribution", "DomainName"],
          },
        },
      })),
    },
  };

  return deployment;
}
