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
        // @TODO: remove ACL when we have access point from cloudfront
        acl: " public-read",
        localDir: "./build",
      },
    ],
  },
  resources: {
    Resources: {
      S3OpenAPI: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: configs.openapi.s3.bucket.name,
          WebsiteConfiguration: {
            IndexDocument: "index.html",
          },
          OwnershipControls: {
            Rules: [
              {
                ObjectOwnership: "BucketOwnerPreferred",
              },
            ],
          },
          PublicAccessBlockConfiguration: {
            BlockPublicPolicy: false,
          },
        },
      },
      S3OpenAPIPolicy: {
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
                    "Fn::Join": [
                      "",
                      ["arn:aws:s3:::", { Ref: "S3OpenAPI" }, "/*"],
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    },
  },
};

module.exports = withCustomDomain(deployment);

function withCustomDomain(deployment: AWS): AWS {
  if (!configs.openapi.domain?.acm?.arn) return deployment;

  if (!configs.openapi.domain?.zone?.id) {
    console.warn(`WARN: ACM ARN is set but no Zone ID is set`);
    return deployment;
  }
  if (
    !Array.isArray(configs.openapi.domain?.aliases) ||
    configs.openapi.domain.aliases.length === 0
  ) {
    console.warn(`WARN: ACM ARN is set but no alias is set`);
    return deployment;
  }

  if (!deployment.resources?.Resources) {
    _.set(deployment, "resources.Resources", {});
  }

  // deployment.resources.Resources.CloudFrontOriginAccessIdentity = {
  //   Type: "AWS::CloudFront::CloudFrontOriginAccessIdentity",
  //   DeletionPolicy: "Delete",
  //   DependsOn: ["S3OpenAPI"],
  //   Properties: {
  //     CloudFrontOriginAccessIdentityConfig: {
  //       Comment: "Access S3 bucket content only through CloudFront",
  //     },
  //   },
  // };

  // @TODO: change S3 policy when we have access point from cloudfront

  deployment.resources.Resources.CloudFrontDistribution = {
    Type: "AWS::CloudFront::Distribution",
    DeletionPolicy: "Delete",
    // DependsOn: ["CloudFrontOriginAccessIdentity"],
    Properties: {
      DistributionConfig: {
        Enabled: true,
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
                  ".s3-website.",
                  { Ref: "AWS::Region" },
                  ".amazonaws.com",
                ],
              ],
            },
            OriginPath: "",
            // Use S3OriginConfig to specify an Amazon S3 bucket that is not configured with static website hosting.
            // S3OriginConfig: {
            //   OriginAccessIdentity: {
            //     "Fn::Join": [
            //       "",
            //       [
            //         "origin-access-identity/cloudfront/",
            //         { Ref: "CloudFrontOriginAccessIdentity" },
            //       ],
            //     ],
            //   },
            // },
            // Otherwise use CustomOriginConfig to specifict s3 website
            CustomOriginConfig: {
              OriginProtocolPolicy: "http-only",
              HTTPPort: 80,
              HTTPSPort: 443,
              OriginSSLProtocols: ["TLSv1.2", "TLSv1.1", "TLSv1"],
            },
          },
        ],
        DefaultCacheBehavior: {
          TargetOriginId: "OpenAPIS3",
          ViewerProtocolPolicy: "redirect-to-https",
          Compress: true,
          DefaultTTL: 0,
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
