import {
  UpdateUserAttributesCommandInput,
  UpdateUserAttributesCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import attributes from "@custom/cognito/attributes.json";

const custom = attributes.reduce(
  (m, attr) => ({ ...m, [attr.Name]: true }),
  {}
);

export interface Req {
  name: string;
  gender?: string;
  picture?: string;
  phone_number?: string;
  [name: string]: string | number;
}

export interface Res {}

export function fromRequest(
  req: Req,
  accessToken: string
): UpdateUserAttributesCommandInput {
  const input: UpdateUserAttributesCommandInput = {
    UserAttributes: [],
    AccessToken: accessToken,
  };
  Object.keys(req).forEach((key) => {
    const value = req[key];
    input.UserAttributes.push({
      Name: Boolean(custom[key]) ? `custom:${key}` : key,
      Value: String(value),
    });
  });

  return input;
}

export function toResponse(_: UpdateUserAttributesCommandOutput): Res {
  return {};
}
