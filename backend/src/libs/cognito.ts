import {
  AdminGetUserCommand,
  AdminGetUserCommandInput,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import get from "lodash/get";
import configs from "@configs";
import { User } from "@domain/entities";
import attributes from "@custom/cognito/attributes.json";

export const client = new CognitoIdentityProviderClient({
  region: configs.aws.region,
});

const maps = attributes.reduce(
  (m, attr) => ({ ...m, [attr.Name]: attr }),
  {} as { [name: string]: { AttributeDataType: string } }
);

export async function user(username: string) {
  const input: AdminGetUserCommandInput = {
    UserPoolId: process.env.BACKEND_COGNITO_POOL_ID,
    Username: username,
  };
  const output = await client.send(new AdminGetUserCommand(input));

  const user: User = {
    sub: output.Username,
    email: "",
    name: "",
    enabled: output.Enabled,
    status: output.UserStatus,
    created_at: new Date(output.UserCreateDate),
    updated_at: new Date(output.UserLastModifiedDate),
    attributes: {},
  };
  if (Array.isArray(output.UserAttributes) && output.UserAttributes.length) {
    output.UserAttributes.forEach((attribute) => {
      if (attribute.Name === "email") user.email = attribute.Value;
      if (attribute.Name === "name") user.name = attribute.Value;
      if (attribute.Name === "gender") user.gender = attribute.Value;
      if (attribute.Name === "picture") user.picture = attribute.Value;
      if (attribute.Name === "phone_number") {
        user.phone_number = attribute.Value;
      }

      if (attribute.Name.startsWith("custom")) {
        const key = attribute.Name.replace("custom:", "");
        const map = maps[key];
        if (map) {
          console.log(map.AttributeDataType);
          switch (map.AttributeDataType) {
            case "Number":
              user.attributes[key] = Number(attribute.Value);
              break;
            default:
              user.attributes[key] = attribute.Value;
          }
        }
      }
    });
  }
  return user;
}

export function genValidatorSchema(
  schema: { [name: string]: any },
  ignoreRequired = false
): {
  [name: string]: any;
} {
  for (const attribute of attributes) {
    // we don't allow modify developer only attributes with APIs
    if (attribute.DeveloperOnlyAttribute) continue;

    if (attribute.Required && !ignoreRequired) {
      schema.required.push(attribute.Name);
    }

    schema.properties[attribute.Name] = {
      type: attribute.AttributeDataType.toLowerCase(),
    };

    const strMaxLength = get(attribute, "StringAttributeConstraints.MaxLength");
    if (strMaxLength) {
      schema.properties[attribute.Name].maxLength = strMaxLength;
    }

    const strMinLength = get(attribute, "StringAttributeConstraints.MinLength");
    if (strMinLength) {
      schema.properties[attribute.Name].minLength = strMinLength;
    }

    const numMaxValue = get(attribute, "NumberAttributeConstraints.MaxValue");
    if (numMaxValue) {
      schema.properties[attribute.Name].maximum = numMaxValue;
    }

    const numMinValue = get(attribute, "NumberAttributeConstraints.MinValue");
    if (numMinValue) {
      schema.properties[attribute.Name].minimum = numMinValue;
    }
  }

  return schema;
}
