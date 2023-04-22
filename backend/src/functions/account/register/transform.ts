import {
  SignUpCommandInput,
  SignUpCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { User } from "@domain/entities";

export interface Req extends User {
  password: string;
}

export interface Res {
  sub: string;
  active: boolean;
}

export function fromRequest(req: Req): SignUpCommandInput {
  const input: SignUpCommandInput = {
    ClientId: process.env.BACKEND_COGNITO_POOL_ID,
    Username: req.email,
    Password: req.password,
    UserAttributes: [],
  };

  if (req.name) {
    input.UserAttributes.push({
      Name: "name",
      Value: req.name,
    });
  }
  if (req.phone_number) {
    input.UserAttributes.push({
      Name: "phone_number",
      Value: req.phone_number,
    });
  }

  return input;
}

export function toResponse(output: SignUpCommandOutput): Res {
  return {
    sub: output.UserSub,
    active: output.UserConfirmed,
  };
}
