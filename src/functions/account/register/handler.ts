import { ProxyResult, Handler } from "aws-lambda";
import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import cfg from "@configs/index";
import { ok } from "@libs/response";
import * as mw from "@functions/middlewares";
import * as cognito from "@libs/cognito";
import { schema } from "@domain/entities";
import { fromRequest, toResponse } from "./transform";
import attributes from "../../../../data/cognito-attributes.json";

const client = cognito.client(cfg.cognito);

const register: Handler<Event, ProxyResult> = async (event) => {
  const input = fromRequest(event.body as any);
  const cmd = new SignUpCommand(input);
  const output = await client.send(cmd);
  return ok(toResponse(output));
};

export const main = middy()
  .use(mw.logger.use())
  .use(json())
  .use(
    mw.validator.use({
      body: mw.validator.compile(
        withAttributeValidator({
          type: "object",
          required: ["password", "email", "name"],
          properties: {
            password: { type: "string", minLength: 6 },
            ...schema,
          },
        })
      ),
    })
  )
  .handler(register)
  .use(mw.error.use());

function withAttributeValidator(schema: { [name: string]: any }): {
  [name: string]: any;
} {
  for (const attribute of attributes) {
    if (attribute.Required) schema.required.push(attribute.Name);

    schema.properties[attribute.Name] = {
      type: attribute.AttributeDataType.toLowerCase(),
    };
    if (attribute.StringAttributeConstraints?.MaxLength) {
      schema.properties[attribute.Name].maxLength =
        attribute.StringAttributeConstraints.MaxLength;
    }
    if (attribute.StringAttributeConstraints?.MinLength) {
      schema.properties[attribute.Name].minLength =
        attribute.StringAttributeConstraints.MinLength;
    }
    if (attribute.NumberAttributeConstraints?.MaxValue) {
      schema.properties[attribute.Name].maximum =
        attribute.NumberAttributeConstraints.MaxValue;
    }
    if (attribute.NumberAttributeConstraints?.MinValue) {
      schema.properties[attribute.Name].minimum =
        attribute.NumberAttributeConstraints.MinValue;
    }
  }

  return schema;
}
