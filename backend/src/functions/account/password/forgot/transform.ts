import {
  ForgotPasswordCommandInput,
  ForgotPasswordCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

export interface Req {
  email: string;
}

export interface Res {
  destination: string;
  attribute_name: string;
}

export function fromRequest(req: Req): ForgotPasswordCommandInput {
  const input: ForgotPasswordCommandInput = {
    ClientId: process.env.BACKEND_COGNITO_POOL_ID,
    Username: req.email,
  };

  return input;
}

export function toResponse(output: ForgotPasswordCommandOutput): Res {
  return {
    destination: output.CodeDeliveryDetails.Destination,
    attribute_name: output.CodeDeliveryDetails.AttributeName,
  };
}
