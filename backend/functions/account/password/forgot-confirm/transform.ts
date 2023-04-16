import {
  ConfirmForgotPasswordCommandInput,
  ConfirmForgotPasswordCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import configs from "@backend/configs";

export interface Req {
  code: string;
  password: string;
  email: string;
}

export interface Res {}

export function fromRequest(req: Req): ConfirmForgotPasswordCommandInput {
  const input: ConfirmForgotPasswordCommandInput = {
    ClientId: configs.backend.cognito.client.id,
    ConfirmationCode: req.code,
    Password: req.password,
    Username: req.email,
  };

  return input;
}

export function toResponse(_: ConfirmForgotPasswordCommandOutput): Res {
  return {};
}
