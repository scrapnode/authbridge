import {
  ForgotPasswordCommandInput,
  ForgotPasswordCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { User } from "@domain/entities";
import cfg from "@configs/index";

export interface Req extends User {
  password: string;
}

export interface Res {
  destination: string;
  attribute_name: string;
}

export function fromRequest(req: Req): ForgotPasswordCommandInput {
  const input: ForgotPasswordCommandInput = {
    ClientId: cfg.cognito.client.id,
    Username: req.email,
  };

  return input;
}

export function toResponse(output: ForgotPasswordCommandOutput): Res {
  console.log(JSON.stringify(output, null, 2));
  return {
    destination: output.CodeDeliveryDetails.Destination,
    attribute_name: output.CodeDeliveryDetails.AttributeName,
  };
}
