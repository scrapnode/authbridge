import * as mw from "@functions/middlewares";
import * as cognito from "@libs/cognito";

export const body = mw.validator.instance.compile<any>(
  cognito.genValidatorSchema({
    type: "object",
    required: ["password", "email", "name"],
    properties: {
      password: { type: "string", minLength: 6 },
      email: { type: "string", format: "email" },
      name: { type: "string", minLength: 1 },
      gender: { type: "string" },
      picture: { type: "string" },
      phone_number: { type: "string" },
    },
  })
);
