import type { AWS } from "@serverless/typescript";
import _ from "lodash";

import configs from "@configs";

const deployment: AWS = {
  service: `${configs.project.id}-frontend`,
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-s3-sync"],
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
    },
    logRetentionInDays: 30,
    timeout: 25,
  },
  // import the function via paths
  package: {
    individually: true,
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
    s3Sync: [
      {
        bucketName: configs.frontend.s3.bucket.name,
        localDir: "./build",
      },
    ],
  },
  resources: {
    Resources: {},
  },
};

module.exports = withCustomDomain(withDefault(deployment));

function hasCustomDomain(): boolean {
  if (!configs.frontend.domain?.acm?.arn) return false;

  if (!configs.frontend.domain?.zone?.id) {
    console.warn(`WARN: ACM ARN is set but no Zone ID is set`);
    return false;
  }
  if (
    !Array.isArray(configs.frontend.domain?.aliases) ||
    configs.frontend.domain.aliases.length === 0
  ) {
    console.warn(`WARN: ACM ARN is set but no alias is set`);
    return false;
  }

  return true;
}

function withDefault(deployment: AWS): AWS {
  if (hasCustomDomain()) return deployment;

  deployment.resources.Resources.S3Frontend = {
    Type: "AWS::S3::Bucket",
    Properties: {
      BucketName: configs.frontend.s3.bucket.name,
      WebsiteConfiguration: {
        IndexDocument: "index.html",
      },
      OwnershipControls: {
        Rules: [
          {
            ObjectOwnership: "BucketOwnerEnforced",
          },
        ],
      },
      PublicAccessBlockConfiguration: {
        BlockPublicPolicy: false,
      },
    },
  };

  deployment.resources.Resources.S3FrontendPolicy = {
    Type: "AWS::S3::BucketPolicy",
    DependsOn: ["S3Frontend"],
    Properties: {
      Bucket: { Ref: "S3Frontend" },
      PolicyDocument: {
        Statement: [
          {
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [
              {
                "Fn::Join": [
                  "",
                  ["arn:aws:s3:::", { Ref: "S3Frontend" }, "/*"],
                ],
              },
            ],
          },
        ],
      },
    },
  };

  return deployment;
}

function withCustomDomain(deployment: AWS): AWS {
  if (!hasCustomDomain()) return deployment;

  deployment.resources.Resources.S3Frontend = {
    Type: "AWS::S3::Bucket",
    Properties: {
      BucketName: configs.frontend.s3.bucket.name,
      OwnershipControls: {
        Rules: [
          {
            ObjectOwnership: "BucketOwnerEnforced",
          },
        ],
      },
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    },
  };

  deployment.resources.Resources.S3FrontendPolicy = {
    Type: "AWS::S3::BucketPolicy",
    DependsOn: ["S3Frontend"],
    Properties: {
      Bucket: { Ref: "S3Frontend" },
      PolicyDocument: {
        Statement: [
          {
            Sid: "CloudfrontGetObject",
            Effect: "Allow",
            Principal: {
              Service: "cloudfront.amazonaws.com",
            },
            Action: ["s3:GetObject"],
            Resource: [
              {
                "Fn::Join": [
                  "",
                  ["arn:aws:s3:::", { Ref: "S3Frontend" }, "/*"],
                ],
              },
            ],
            Condition: {
              StringEquals: {
                "AWS:SourceArn": {
                  "Fn::Join": [
                    "",
                    [
                      "arn:aws:cloudfront::",
                      { Ref: "AWS::AccountId" },
                      ":distribution/",
                      { Ref: "CloudFrontDistribution" },
                    ],
                  ],
                },
              },
            },
          },
        ],
      },
    },
  };

  deployment.resources.Resources.CloudFrontOriginAccessControl = {
    Type: "AWS::CloudFront::OriginAccessControl",
    Properties: {
      OriginAccessControlConfig: {
        Description: "Default Origin Access Control",
        Name: { Ref: "AWS::StackName" },
        OriginAccessControlOriginType: "s3",
        SigningBehavior: "always",
        SigningProtocol: "sigv4",
      },
    },
  };

  deployment.resources.Resources.CloudFrontDistribution = {
    Type: "AWS::CloudFront::Distribution",
    DependsOn: ["CloudFrontOriginAccessControl"],
    DeletionPolicy: "Delete",
    Properties: {
      DistributionConfig: {
        Enabled: true,
        DefaultRootObject: "index.html",
        PriceClass: "PriceClass_100",
        HttpVersion: "http2",
        Comment: `Api distribution for ${configs.frontend.domain.aliases}`,
        Origins: [
          {
            Id: "OpenAPIS3",
            DomainName: {
              "Fn::Join": [
                "",
                [
                  { Ref: "S3Frontend" },
                  ".s3.",
                  { Ref: "AWS::Region" },
                  ".amazonaws.com",
                ],
              ],
            },
            OriginPath: "",
            S3OriginConfig: {
              OriginAccessIdentity: "",
            },
            OriginAccessControlId: {
              "Fn::GetAtt": ["CloudFrontOriginAccessControl", "Id"],
            },
          },
        ],
        DefaultCacheBehavior: {
          TargetOriginId: "OpenAPIS3",
          ViewerProtocolPolicy: "redirect-to-https",
          Compress: true,
          DefaultTTL: 60,
          AllowedMethods: ["HEAD", "OPTIONS", "GET"],
          CachedMethods: ["HEAD", "OPTIONS", "GET"],
          ForwardedValues: {
            QueryString: false,
            Headers: ["Accept", "x-api-key"],
            Cookies: {
              Forward: "none",
            },
          },
        },
        Aliases: configs.frontend.domain.aliases,
        ViewerCertificate: {
          SslSupportMethod: "sni-only",
          MinimumProtocolVersion: "TLSv1.2_2019",
          AcmCertificateArn: configs.frontend.domain.acm.arn,
        },
      },
    },
  };

  deployment.resources.Resources.Route53RecordSetGroup = {
    Type: "AWS::Route53::RecordSetGroup",
    DeletionPolicy: "Delete",
    DependsOn: ["CloudFrontDistribution"],
    Properties: {
      HostedZoneId: configs.frontend.domain.zone.id,
      RecordSets: configs.frontend.domain.aliases.map((alias) => ({
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
