import {
  ChangePasswordCommandInput,
  ChangePasswordCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

export interface Req {
  previous_password: string;
  proposed_password: string;
}

export interface Res {}

export function fromRequest(
  req: Req,
  accessToken: string
): ChangePasswordCommandInput {
  const input: ChangePasswordCommandInput = {
    PreviousPassword: req.previous_password,
    ProposedPassword: req.proposed_password,
    AccessToken: accessToken,
  };

  return input;
}

export function toResponse(_: ChangePasswordCommandOutput): Res {
  return {};
}
