import { ProxyResult, Handler } from "aws-lambda";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import * as yup from "yup";
import { ok } from "@libs/response";
import * as mw from "@functions/middlewares";

const register: Handler<Event, ProxyResult> = async (event, context) => {
  return ok({ event, context });
};

export const main = middy()
  .use(json())
  .use(mw.logger.use())
  .use(
    mw.validator.use({
      event: yup.object().shape({
        body: yup.object().shape({
          username: yup.string().required(),
          password: yup.string().required().min(6),
          family_name: yup.string(),
          given_name: yup.string(),
          phone_number: yup.string(),
        }),
      }),
    })
  )
  .handler(register);
