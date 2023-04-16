import { ProxyResult, Handler } from "aws-lambda";
import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import { ok } from "@backend/libs/response";
import * as mw from "@backend/functions/middlewares";
import * as cognito from "@backend/libs/cognito";
import * as helpers from "@backend/helpers/index";
import { schema } from "@backend/domain/entities";
import { fromRequest, toResponse } from "./transform";

const register: Handler<Event, ProxyResult> = async (event) => {
  const input = fromRequest(event.body as any);
  const cmd = new SignUpCommand(input);
  const output = await cognito.client.send(cmd);
  return ok(toResponse(output));
};

export const main = middy()
  .use(mw.logger.use())
  .use(json())
  .use(
    mw.validator.use({
      body: mw.validator.instance.compile<any>(
        helpers.cognito.attributes.validator({
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
