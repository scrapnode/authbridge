import * as mw from "@functions/middlewares";
import * as cognito from "@libs/cognito";

export const headers = mw.validator.instance.compile<any>({
  type: "object",
  required: ["authorization"],
  properties: {
    authorization: { type: "string" },
  },
});

export const body = mw.validator.instance.compile<any>(
  cognito.genValidatorSchema(
    {
      type: "object",
      required: [],
      properties: {
        name: { type: "string", minLength: 1 },
        gender: { type: "string" },
        picture: { type: "string" },
        phone_number: { type: "string" },
      },
    },
    true
  )
);
