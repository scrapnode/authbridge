import {
  AttributeType,
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Cognito as CognitoOpts } from "@configs/cognito";
import { logger } from "@libs/logger";

export interface User {
  Username: string;
  UserCreateDate: Date;
  UserLastModifiedDate: Date;
  Enabled: boolean;
  UserStatus: string;
  UserAttributes: AttributeType[];
}

export class Cognito {
  private readonly opts: CognitoOpts;
  private readonly client: CognitoIdentityProviderClient;
  constructor(opst: CognitoOpts) {
    this.opts = opst;
    this.client = new CognitoIdentityProviderClient({ region: opst.region });
  }

  async user(username: string): Promise<User> {
    const cmd = new AdminGetUserCommand({
      UserPoolId: this.opts.pool.id,
      Username: username,
    });
    const output = await this.client.send(cmd).catch((err) => {
      logger.error({ poolId: this.opts.pool.id, username }, err.message);
      return Promise.reject(err);
    });
    return {
      Username: output.Username,
      UserCreateDate: output.UserCreateDate,
      UserLastModifiedDate: output.UserLastModifiedDate,
      Enabled: output.Enabled,
      UserStatus: output.UserStatus,
      UserAttributes: output.UserAttributes,
    };
  }
}
