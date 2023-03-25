import { ProxyResult, Handler } from "aws-lambda";
import {
  SignUpCommand,
  SignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import * as yup from "yup";
import cfg from "@configs/index";
import { ok } from "@libs/response";
import * as mw from "@functions/middlewares";
import * as cognito from "@libs/cognito";

const client = cognito.client(cfg.cognito);

interface Req {
  username: string;
  password: string;
  name?: string;
  phone_number?: string;
}

const register: Handler<Event, ProxyResult> = async (event) => {
  const req: Req = event.body as any;
  const input: SignUpCommandInput = {
    ClientId: cfg.cognito.client.id,
    Username: req.username,
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

export const main = middy()
  .use(json())
  .use(mw.logger.use())
  .use(
    mw.validator.use<Event>({
      event: yup.object().shape({
        body: yup.object().shape({
          username: yup.string().required(),
          password: yup.string().required().min(6),
          name: yup.string(),
        }),
      }),
    })
  )
  .handler(register);
