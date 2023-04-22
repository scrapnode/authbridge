import {
  InitiateAuthCommandInput,
  InitiateAuthCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

export interface Req {
  refresh_token: string;
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
    ClientId: process.env.BACKEND_COGNITO_POOL_ID,
    AuthFlow: "REFRESH_TOKEN_AUTH",
    AuthParameters: {
      REFRESH_TOKEN: req.refresh_token,
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
