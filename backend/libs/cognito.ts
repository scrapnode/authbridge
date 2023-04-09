import {
  AdminGetUserCommand,
  AdminGetUserCommandInput,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { Cognito } from "@configs/cognito";
import { User } from "@domain/entities";
import attributes from "@data/cognito-attributes.json";

export function client(opts: Cognito) {
  return new CognitoIdentityProviderClient({ region: opts.region });
}

export function withUser(opts: Cognito) {
  const c = client(opts);

  const maps = attributes.reduce(
    (m, attr) => ({ ...m, [attr.Name]: attr }),
    {} as { [name: string]: { AttributeDataType: string } }
  );

  return async function (username: string): Promise<User> {
    const input: AdminGetUserCommandInput = {
      UserPoolId: opts.pool.id,
      Username: username,
    };
    const output = await c.send(new AdminGetUserCommand(input));

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
  };
}
