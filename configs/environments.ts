import { project } from "./project";
import { cognito } from "./cognito";

export const environments: { [name: string]: any } = {
  AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID || "",
  PROJECT_ENV: project.env,
  PROJECT_NAME: project.name,
  PROJECT_REGION: project.region,
  COGNITO_POOL_ID: cognito.pool.id,
  COGNITO_CLIENT_ID: cognito.client.id,
};

// those refs will be resolved by serverless template
// then it will be set as environment
// later, in lambda function on aws we can use it
if (!environments.AWS_ACCOUNT_ID) {
  environments.AWS_ACCOUNT_ID = { Ref: "AWS::AccountId" };
}
if (!environments.COGNITO_POOL_ID) {
  environments.COGNITO_POOL_ID = { Ref: "UserPool" };
}
if (!environments.COGNITO_CLIENT_ID) {
  environments.COGNITO_CLIENT_ID = { Ref: "UserPoolClient" };
}
