import type { AWS } from "@serverless/typescript";
import _ from "lodash";

import configs from "@configs";

const deployment: AWS = {
  service: `${configs.project.id}-openapi`,
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
        bucketName: configs.openapi.s3.bucket.name,
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
  if (!configs.openapi.domain?.acm?.arn) return false;

  if (!configs.openapi.domain?.zone?.id) {
    console.warn(`WARN: ACM ARN is set but no Zone ID is set`);
    return false;
  }
  if (
    !Array.isArray(configs.openapi.domain?.aliases) ||
    configs.openapi.domain.aliases.length === 0
  ) {
    console.warn(`WARN: ACM ARN is set but no alias is set`);
    return false;
  }

  return true;
}

function withDefault(deployment: AWS): AWS {
  if (hasCustomDomain()) return deployment;

  deployment.resources.Resources.S3OpenAPI = {
    Type: "AWS::S3::Bucket",
    Properties: {
      BucketName: configs.openapi.s3.bucket.name,
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

  deployment.resources.Resources.S3OpenAPIPolicy = {
    Type: "AWS::S3::BucketPolicy",
    DependsOn: ["S3OpenAPI"],
    Properties: {
      Bucket: { Ref: "S3OpenAPI" },
      PolicyDocument: {
        Statement: [
          {
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [
              {
                "Fn::Join": ["", ["arn:aws:s3:::", { Ref: "S3OpenAPI" }, "/*"]],
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

  deployment.resources.Resources.S3OpenAPI = {
    Type: "AWS::S3::Bucket",
    Properties: {
      BucketName: configs.openapi.s3.bucket.name,
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

  deployment.resources.Resources.S3OpenAPIPolicy = {
    Type: "AWS::S3::BucketPolicy",
    DependsOn: ["S3OpenAPI"],
    Properties: {
      Bucket: { Ref: "S3OpenAPI" },
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
                "Fn::Join": ["", ["arn:aws:s3:::", { Ref: "S3OpenAPI" }, "/*"]],
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
        Comment: `Api distribution for ${configs.openapi.domain.aliases}`,
        Origins: [
          {
            Id: "OpenAPIS3",
            DomainName: {
              "Fn::Join": [
                "",
                [
                  { Ref: "S3OpenAPI" },
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
        Aliases: configs.openapi.domain.aliases,
        ViewerCertificate: {
          SslSupportMethod: "sni-only",
          MinimumProtocolVersion: "TLSv1.2_2019",
          AcmCertificateArn: configs.openapi.domain.acm.arn,
        },
      },
    },
  };

  deployment.resources.Resources.Route53RecordSetGroup = {
    Type: "AWS::Route53::RecordSetGroup",
    DeletionPolicy: "Delete",
    DependsOn: ["CloudFrontDistribution"],
    Properties: {
      HostedZoneId: configs.openapi.domain.zone.id,
      RecordSets: configs.openapi.domain.aliases.map((alias) => ({
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
