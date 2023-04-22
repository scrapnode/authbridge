import * as mw from "@functions/middlewares";

export const body = mw.validator.instance.compile<any>({
  type: "object",
  required: ["email"],
  properties: {
    email: { type: "string", format: "email" },
  },
});
