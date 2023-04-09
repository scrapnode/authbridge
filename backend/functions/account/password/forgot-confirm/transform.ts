import {
  ConfirmForgotPasswordCommandInput,
  ConfirmForgotPasswordCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import cfg from "@configs/index";

export interface Req {
  code: string;
  password: string;
  email: string;
}

export interface Res {}

export function fromRequest(req: Req): ConfirmForgotPasswordCommandInput {
  const input: ConfirmForgotPasswordCommandInput = {
    ClientId: cfg.cognito.client.id,
    ConfirmationCode: req.code,
    Password: req.password,
    Username: req.email,
  };

  return input;
}

export function toResponse(_: ConfirmForgotPasswordCommandOutput): Res {
  return {};
}
