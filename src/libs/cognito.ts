import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { Cognito as CognitoOpts } from "@configs/cognito";

export function client(opts: CognitoOpts) {
  return new CognitoIdentityProviderClient({ region: opts.region });
}
