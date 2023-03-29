import {
  InitiateAuthCommandInput,
  InitiateAuthCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import cfg from "@configs/index";

export interface Req {
  email: string;
  password: string;
}

export interface Res {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}

export function fromRequest(req: Req): InitiateAuthCommandInput {
  return {
    ClientId: cfg.cognito.client.id,
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: req.email,
      PASSWORD: req.password,
    },
  };
}

export function toResponse(output: InitiateAuthCommandOutput): Res {
  return {
    access_token: output.AuthenticationResult.AccessToken,
    refresh_token: output.AuthenticationResult.RefreshToken,
    id_token: output.AuthenticationResult.IdToken,
    expires_in: output.AuthenticationResult.ExpiresIn,
    token_type: output.AuthenticationResult.TokenType,
  };
}
