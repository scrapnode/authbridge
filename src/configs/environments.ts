import { project } from "@configs/project";
import { cognito } from "@configs/cognito";

export const environments: { [name: string]: any } = {
  PROJECT_ENV: project.env,
  PROJECT_NAME: project.name,
  PROJECT_REGION: project.region,
  COGNITO_POOL_ID: cognito.pool.id,
  COGNITO_CLIENT_ID: cognito.client.id,
};

// those refs will be resolved by serverless template
// then it will be set as environment
// later, in lambda function on aws we can use it
if (!project.debug) {
  environments.AWS_ACCOUNT_ID = { Ref: "AWS::AccountId" };
  environments.COGNITO_POOL_ID = { Ref: "UserPool" };
  environments.COGNITO_CLIENT_ID = { Ref: "UserPoolClient" };
}
