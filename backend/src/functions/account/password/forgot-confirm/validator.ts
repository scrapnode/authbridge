import * as mw from "@functions/middlewares";

export const body = mw.validator.instance.compile<any>({
  type: "object",
  required: ["code", "password", "email"],
  properties: {
    code: { type: "string" },
    password: { type: "string", format: "password", minLength: 6 },
    email: { type: "string", format: "email" },
  },
});
