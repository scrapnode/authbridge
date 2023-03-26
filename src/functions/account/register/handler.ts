import { ProxyResult, Handler } from "aws-lambda";
import {
  SignUpCommand,
  SignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import cfg from "@configs/index";
import { ok } from "@libs/response";
import * as mw from "@functions/middlewares";
import * as cognito from "@libs/cognito";
import attributes from "../../../../data/cognito_attributes.json";

const client = cognito.client(cfg.cognito);

interface Req {
  password: string;

  email: string;
  name: string;
  phone_number?: string;
  gender?: string;
  picture?: string;
  [name: string]: string | number;
}

const register: Handler<Event, ProxyResult> = async (event) => {
  const req: Req = event.body as any;
  const input: SignUpCommandInput = {
    ClientId: cfg.cognito.client.id,
    Username: req.email,
    Password: req.password,
    UserAttributes: [],
  };
  // @TODO: duplicated code
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

  const cmd = new SignUpCommand(input);
  const output = await client.send(cmd);

  return ok(output);
};

const body: { [name: string]: any } = {
  type: "object",
  required: ["password", "email", "name"],
  properties: {
    password: { type: "string", minLength: 6 },
    email: { type: "string", format: "email" },
    name: { type: "string", minLength: 1 },
    phone_number: { type: "string" },
    gender: { type: "string" },
    picture: { type: "string" },
  },
};
for (const attribute of attributes) {
  if (attribute.Required) body.required.push(attribute.Name);

  body.properties[attribute.Name] = {
    type: attribute.AttributeDataType.toLowerCase(),
  };
  if (attribute.StringAttributeConstraints?.MaxLength) {
    body.properties[attribute.Name].maxLength =
      attribute.StringAttributeConstraints.MaxLength;
  }
  if (attribute.StringAttributeConstraints?.MinLength) {
    body.properties[attribute.Name].minLength =
      attribute.StringAttributeConstraints.MinLength;
  }
  if (attribute.NumberAttributeConstraints?.MaxValue) {
    body.properties[attribute.Name].maximum =
      attribute.NumberAttributeConstraints.MaxValue;
  }
  if (attribute.NumberAttributeConstraints?.MinValue) {
    body.properties[attribute.Name].minimum =
      attribute.NumberAttributeConstraints.MinValue;
  }
}

export const main = middy()
  .use(json())
  .use(mw.logger.use())
  .use(
    validator({
      eventSchema: transpileSchema({
        type: "object",
        required: ["body"],
        properties: { body },
      }),
    })
  )
  .handler(register);
